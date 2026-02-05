import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from '../client/client.entity';
import { Address } from '../client/address.entity'; // Importação única e correta

@Injectable()
export class PgConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const url = this.configService.get<string>('DATABASE_URL');
    
    // --- DEBUG: LOGS DE CONEXÃO ---
    console.log('\n==================================================');
    console.log('🔍 DATABASE CONFIG:');
    console.log('STATUS URL:', url ? 'URL ENCONTRADA ✅' : 'URL NÃO ENCONTRADA ❌');
    console.log('ENTIDADES:', ['Client', 'Address'].join(', '));
    console.log('==================================================\n');

    return {
      type: 'postgres',
      url: url,
      // Incluímos ambas as entidades aqui para o TypeORM gerenciar
      entities: [Client, Address], 
      // synchronize: true faz com que o TypeORM crie as tabelas no Neon automaticamente
      synchronize: true, 
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
}