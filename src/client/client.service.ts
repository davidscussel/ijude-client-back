import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Client } from './client.entity';
import { Address } from './address.entity';
import { CreateClientDto } from './create-client-dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  // --- MÉTODO PRIVADO: ENVIO VIA API BREVO ---
  private async sendBrevoEmail(to: string, subject: string, htmlContent: string) {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error('❌ ERRO: BREVO_API_KEY não configurada no Render/Ambiente.');
      return;
    }

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'iJude', email: 'cadastro@ijude.com.br' },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent,
        },
        {
          headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
          },
        },
      );
      console.log(`✅ E-mail enviado com sucesso para: ${to}`);
    } catch (error) {
      console.error('❌ Erro na API do Brevo:', error.response?.data || error.message);
    }
  }

  /**
   * --- NOVO MÉTODO: ACEITAR TERMOS (SOLUÇÃO DO LOOP) ---
   * Este método altera o status no banco Neon de FALSE para TRUE.
   */
  async acceptTerms(id: string) {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    // Altera o estado do objeto
    client.termsAccepted = true;

    // Persiste a mudança no banco de dados Neon
    const updatedClient = await this.clientRepository.save(client);

    // Retorna o usuário atualizado sem dados sensíveis
    const { password, verification_code, ...result } = updatedClient;
    return result;
  }

  // --- CADASTRO DE CLIENTE ---
  async create(createClientDto: CreateClientDto) {
    const emailNormalized = createClientDto.email.trim().toLowerCase();

    const existingClient = await this.clientRepository.findOne({ 
      where: { email: emailNormalized } 
    });
    
    if (existingClient) {
      throw new BadRequestException('Este e-mail já está cadastrado.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newClient = this.clientRepository.create({
      ...createClientDto,
      email: emailNormalized,
      verification_code: code,
      is_verified: false,
    });

    const savedClient = await this.clientRepository.save(newClient);

    await this.sendBrevoEmail(
      savedClient.email,
      'Bem-vindo ao iJude! Confirme seu cadastro 🛠️',
      `
        <div style="font-family: sans-serif; max-width: 600px; color: #0F172A;">
          <h2>Olá, ${savedClient.name}!</h2>
          <p>Ficamos felizes com seu cadastro. Use o código abaixo para verificar sua conta:</p>
          <div style="background: #F1F5F9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563EB;">${code}</span>
          </div>
          <p>Se não foi você quem solicitou, apenas ignore este e-mail.</p>
        </div>
      `
    );

    return savedClient;
  }

  // --- VERIFICAÇÃO DE CÓDIGO ---
  async verifyCode(email: string, code: string) {
    const client = await this.clientRepository.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!client) {
      throw new BadRequestException('Cliente não encontrado');
    }

    if (client.verification_code === code) {
      client.is_verified = true;
      client.verification_code = null; 
      const updatedClient = await this.clientRepository.save(client);

      const { password, verification_code, ...result } = updatedClient;
      return result; 
    } else {
      throw new BadRequestException('Código inválido!');
    }
  }

  // --- LOGIN ---
  async login(email: string, pass: string) {
    const emailNormalized = email.trim().toLowerCase();
    const client = await this.clientRepository.findOne({ where: { email: emailNormalized } });

    if (!client || client.password !== pass) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (!client.is_verified) {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      client.verification_code = newCode;
      await this.clientRepository.save(client);

      await this.sendBrevoEmail(
        client.email,
        'Confirme sua identidade - iJude',
        `<p>Sua conta ainda não foi verificada no iJude. Use o código: <b>${newCode}</b></p>`
      );

      throw new ForbiddenException({ 
        message: 'Conta não verificada. Enviamos um novo código para seu e-mail.', 
        needVerification: true, 
        email: client.email 
      });
    }

    const { password, verification_code, ...result } = client;
    return result;
  }

  // --- GESTÃO DE ENDEREÇOS ---
  async saveAddress(addressData: { clientId: string; [key: string]: any }): Promise<Address> {
    const { clientId, ...rest } = addressData;
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    const addressInstance = this.addressRepository.create({ ...rest, client: client });
    return await this.addressRepository.save(addressInstance);
  }

  async getAddressesByClient(clientId: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { client: { id: clientId } }, 
      order: { label: 'ASC' } 
    });
  }

  findAll() {
    return this.clientRepository.find();
  }
}