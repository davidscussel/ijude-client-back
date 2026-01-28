import { Controller, Post, Body, Get } from '@nestjs/common';
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
  verify(@Body() body: { phone: string; code: string }) {
    return this.clientService.verifyCode(body.phone, body.code);
  }

  // --- ROTA DE LOGIN NOVA ---
  @Post('login')
  login(@Body() body: { email: string; pass: string }) {
    return this.clientService.login(body.email, body.pass);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }
}