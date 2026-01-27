import { InjectRepository } from "@nestjs/typeorm";
import { ClientDTO } from "./client-dto";
import { CreateClientDTO } from "./create-client-dto";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { ClientEntity } from "./client.entity";

@Injectable()
export class ClientService{

    constructor(
        @InjectRepository(ClientEntity)
        private readonly clientRepository: Repository<ClientEntity>
    ){}

    public async createClient( client :CreateClientDTO):Promise<ClientDTO>{
        await this.clientRepository.save(client)
        return await this.clientRepository.findOne({where: {name: client.name}})
    }
}