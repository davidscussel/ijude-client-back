import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      client.verification_code = null;
      await this.clientRepository.save(client);
      return { message: 'Conta verificada!' };
    } else {
      throw new BadRequestException('Código inválido!');
    }
  }

  // --- LOGIN COM REENVIO DE SMS ---
  async login(email: string, pass: string) {
    const client = await this.clientRepository.findOne({ where: { email } });

    if (!client || client.password !== pass) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (!client.is_verified) {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      client.verification_code = newCode;
      await this.clientRepository.save(client);

      console.log('\n=============================================');
      console.log(`⚠️ LOGIN BLOQUEADO: CONTA NÃO VERIFICADA`);
      console.log(`🔑 NOVO CÓDIGO: ${newCode}`);
      console.log('=============================================\n');

      throw new ForbiddenException({ 
        message: 'Conta não verificada.', 
        needVerification: true, 
        phone: client.phone 
      });
    }

    const { password, verification_code, ...result } = client;
    return result;
  }

  // --- GESTÃO DE ENDEREÇOS ---

  /**
   * Salva um novo endereço vinculado a um cliente específico.
   * A tipagem foi ajustada para garantir que o TS reconheça o retorno único.
   */
  async saveAddress(addressData: { clientId: string; [key: string]: any }): Promise<Address> {
    const { clientId, ...rest } = addressData;

    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    
    if (!client) {
      throw new NotFoundException('Cliente não encontrado para vincular o endereço.');
    }

    // Criamos a instância manualmente para garantir que as propriedades batam com a classe Address
    const addressInstance = this.addressRepository.create({
      label: rest.label,
      street: rest.street,
      number: rest.number,
      zipCode: rest.zipCode,
      neighborhood: rest.neighborhood,
      city: rest.city,
      complement: rest.complement,
      client: client, 
    });

    // O retorno de save() agora satisfará a Promise<Address>
    return await this.addressRepository.save(addressInstance);
  }

  /**
   * Retorna todos os endereços vinculados ao ID de um cliente específico
   */
  async getAddressesByClient(clientId: string): Promise<Address[]> {
  return await this.addressRepository.find({
    where: { client: { id: clientId } }, 
    order: { label: 'ASC' } 
  });
}

  // --- UTILITÁRIOS ---
  findAll() {
    return this.clientRepository.find();
  }
}