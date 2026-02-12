import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { PgConfigService } from './config/pg.config.service';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    // Configuração global para carregar o arquivo .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuração assíncrona do Banco de Dados (Neon)
    TypeOrmModule.forRootAsync({
      useClass: PgConfigService,
    }),

    // Configuração assíncrona do Mailer para o Brevo
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('BREVO_HOST') || 'smtp-relay.brevo.com',
          port: config.get<number>('BREVO_PORT') || 587,
          auth: {
            user: config.get('BREVO_USER'), // Busca o usuário no seu .env
            pass: config.get('BREVO_PASS'), // Busca a chave API no seu .env
          },
        },
        defaults: {
          from: '"Cadastro iJude" <cadastro@ijude.com.br>', // Formato correto do remetente
        },
      }),
      inject: [ConfigService],
    }),

    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}