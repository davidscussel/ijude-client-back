import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgConfigService } from './config/pg.config.service';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    // 1. Configuração global para carregar o arquivo .env e variáveis do Render
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configuração assíncrona do Banco de Dados (Neon)
    TypeOrmModule.forRootAsync({
      useClass: PgConfigService,
    }),

    // 3. Módulo do Cliente (Onde agora reside a lógica da API do Brevo)
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}