// src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './client.entity';
import { Address } from './address.entity'; // Certifique-se de que o caminho está correto

@Module({
  // Registramos ambas as entidades para que o synchronize: true as crie no Neon
  imports: [TypeOrmModule.forFeature([Client, Address])], 
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}