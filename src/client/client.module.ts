import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './client.entity';
import { Address } from './address.entity';

@Module({
  imports: [
    // Importa as entidades para o TypeORM
    TypeOrmModule.forFeature([Client, Address]), 
  ],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}