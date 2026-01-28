// src/Client/create-client-dto.ts
export class CreateClientDto { // <--- Mudamos de DTO para Dto (padronizando)
  name: string;
  email: string;
  phone: string;
  password: string;
  
  // Adicione estes campos novos para o cadastro funcionar
  cpf: string;
  birthDate: string;
}