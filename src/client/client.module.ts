// src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer'; // Importação essencial para o envio de e-mail
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './client.entity';
import { Address } from './address.entity';

@Module({
  imports: [
    // 1. Registra as entidades para que os repositórios sejam criados
    TypeOrmModule.forFeature([Client, Address]), 
    
    // 2. Importa o MailerModule para permitir a injeção do MailerService no ClientService
    MailerModule, 
  ],
  controllers: [ClientController],
  providers: [ClientService],
  // Exportamos o serviço para que ele possa ser usado em outros módulos se necessário
  exports: [ClientService], 
})
export class ClientModule {}