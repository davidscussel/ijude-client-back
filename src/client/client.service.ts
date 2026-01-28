import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './create-client-dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  // --- CADASTRO ---
  async create(createClientDto: CreateClientDto) {
    // Verifica se o e-mail já existe
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

    console.log('\n=============================================');
    console.log(`📱 [NOVO CADASTRO] Para: ${savedClient.phone}`);
    console.log(`🔑 CÓDIGO: ${code}`);
    console.log('=============================================\n');

    return savedClient;
  }

  // --- VERIFICAÇÃO DE SMS ---
  async verifyCode(phone: string, code: string) {
    const client = await this.clientRepository.findOne({ where: { phone } });

    if (!client) throw new BadRequestException('Cliente não encontrado');

    if (client.verification_code === code) {
      client.is_verified = true;
      client.verification_code = null; // Limpa o código após usar por segurança
      await this.clientRepository.save(client);
      return { message: 'Conta verificada!' };
    } else {
      throw new BadRequestException('Código inválido!');
    }
  }

  // --- LOGIN INTELIGENTE (ATUALIZADO) ---
  async login(email: string, pass: string) {
    // 1. Busca o usuário pelo e-mail
    const client = await this.clientRepository.findOne({ where: { email } });

    // 2. Valida se usuário existe e senha bate
    if (!client || client.password !== pass) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // 3. LÓGICA DE REENVIO AUTOMÁTICO
    // Se a senha está certa, mas ele não verificou o SMS:
    if (!client.is_verified) {
      
      // Gera um NOVO código agora mesmo
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Atualiza no banco
      client.verification_code = newCode;
      await this.clientRepository.save(client);

      // Mostra no terminal (Simulação de envio)
      console.log('\n=============================================');
      console.log(`⚠️ LOGIN BLOQUEADO: CONTA NÃO VERIFICADA`);
      console.log(`📱 REENVIANDO SMS Para: ${client.phone}`);
      console.log(`🔑 NOVO CÓDIGO: ${newCode}`);
      console.log('=============================================\n');

      // Lança erro 403 Forbidden com dados para o Frontend navegar
      throw new ForbiddenException({ 
        message: 'Conta não verificada.', 
        needVerification: true, // Flag para o App saber o que fazer
        phone: client.phone     // Envia o telefone para preencher a próxima tela
      });
    }

    // 4. Sucesso! Remove dados sensíveis do retorno
    const { password, verification_code, ...result } = client;
    
    return result;
  }

  findAll() {
    return this.clientRepository.find();
  }
}