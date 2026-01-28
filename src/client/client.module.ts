// src/Client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './client.entity'; // <--- Importando Client correto

@Module({
  imports: [TypeOrmModule.forFeature([Client])], // <--- Usando Client
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}