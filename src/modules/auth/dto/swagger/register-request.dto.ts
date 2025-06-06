import { ApiProperty } from '@nestjs/swagger';

export class RegistroRequestSwaggerDto {
  @ApiProperty({ example: 'Jhony Teste', required: false })
  nome: string;

  @ApiProperty({ example: 'jhony@email.com', required: false })
  email: string;

  @ApiProperty({ example: 'Admin2025', required: false })
  senha: string;
}
