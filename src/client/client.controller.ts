import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './create-client-dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Post('verify')
  async verify(@Body() body: { email: string; code: string }) {
    return this.clientService.verifyCode(body.email, body.code);
  }

  @Post('login')
  login(@Body() body: { email: string; pass: string }) {
    return this.clientService.login(body.email, body.pass);
  }

  // --- NOVAS ROTAS DE ENDEREÇO ---

  /**
   * Endpoint: POST /client/address
   * Usado pela AddressRegistrationPage no Flutter para salvar novos endereços
   */
  @Post('address')
  async createAddress(@Body() addressData: any) {
    return await this.clientService.saveAddress(addressData);
  }

  /**
   * Endpoint: GET /client/addresses/:clientId
   * Usado para listar os endereços de um cliente específico na Home
   */
@Get('addresses/:clientId')
async listAddresses(@Param('clientId') clientId: string) {
  return await this.clientService.getAddressesByClient(clientId);
}

// -------------------------------

@Get()
findAll() {
  return this.clientService.findAll();
}


}