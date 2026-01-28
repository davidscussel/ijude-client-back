import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from '../client/client.entity'; // <--- Garanta que o caminho está certo (minúsculo)

@Injectable()
export class PgConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // --- DEBUG: IMPRIMIR NO TERMINAL ---
    const url = this.configService.get<string>('DATABASE_URL');
    console.log('\n==================================================');
    console.log('🔍 TENTANDO LER DO .ENV:', url ? 'URL ENCONTRADA ✅' : 'URL NÃO ENCONTRADA (UNDEFINED) ❌');
    console.log('==================================================\n');
    // -----------------------------------

    return {
      type: 'postgres',
      url: url, // Usa a variável capturada
      entities: [Client],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
}