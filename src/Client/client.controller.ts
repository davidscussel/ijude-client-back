import { Body, Controller, Post } from "@nestjs/common";
import { CreateClientDTO } from "./create-client-dto";
import { ClientDTO } from "./client-dto";
import { ClientService } from "./client.service";

@Controller('clients')
export class ClientController {
    constructor(private readonly clientService: ClientService){}
    @Post('')
    async addClient(@Body() client:CreateClientDTO):Promise<ClientDTO>{
        return await this.clientService.createClient(client);
    }
}