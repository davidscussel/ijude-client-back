import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
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

    private readonly mailerService: MailerService, 
  ) {}

  // --- CADASTRO DE CLIENTE ---
  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({ 
      where: { email: createClientDto.email } 
    });
    
    if (existingClient) {
      throw new BadRequestException('Este e-mail já está cadastrado.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newClient = this.clientRepository.create({
      ...createClientDto,
      verification_code: code,
      is_verified: false,
    });

    const savedClient = await this.clientRepository.save(newClient);

    try {
      await this.mailerService.sendMail({
        to: savedClient.email,
        subject: 'Bem-vindo ao iJude! Confirme seu cadastro 🛠️',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; color: #0F172A;">
            <h2>Olá, ${savedClient.name}!</h2>
            <p>Ficamos felizes com seu cadastro. Use o código abaixo para verificar sua conta:</p>
            <div style="background: #F1F5F9; padding: 20px; text-align: center; border-radius: 12px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563EB;">${code}</span>
            </div>
          </div>
        `,
      });
      console.log(`✅ Código enviado para: ${savedClient.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
    }

    return savedClient;
  }

  // --- VERIFICAÇÃO DE CÓDIGO (ATUALIZADO PARA RETORNAR USUÁRIO) ---
  async verifyCode(email: string, code: string) {
    const client = await this.clientRepository.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!client) {
      console.log(`❌ Tentativa de verificação: e-mail ${email} não encontrado.`);
      throw new BadRequestException('Cliente não encontrado');
    }

    if (client.verification_code === code) {
      client.is_verified = true;
      client.verification_code = null; 
      const updatedClient = await this.clientRepository.save(client);

      // RETORNO DE DADOS PARA LOGIN AUTOMÁTICO
      // Removemos campos sensíveis antes de retornar para o Flutter
      const { password, verification_code, ...result } = updatedClient;
      return result; 
    } else {
      throw new BadRequestException('Código inválido!');
    }
  }

  // --- LOGIN ---
  async login(email: string, pass: string) {
    const client = await this.clientRepository.findOne({ where: { email } });

    if (!client || client.password !== pass) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (!client.is_verified) {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      client.verification_code = newCode;
      await this.clientRepository.save(client);

      try {
        await this.mailerService.sendMail({
          to: client.email,
          subject: 'Confirme sua identidade - iJude',
          html: `<p>Sua conta ainda não foi verificada. Use o novo código: <b>${newCode}</b></p>`,
        });
      } catch (e) {
        console.error('Erro no reenvio de e-mail:', e);
      }

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