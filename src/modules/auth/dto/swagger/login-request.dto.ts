import { ApiProperty } from '@nestjs/swagger';

// O required "false" é para que seja possível validar
// o DTO com o ZodValidationPipe
export class LoginRequestDto {
  @ApiProperty({ example: 'jhony@email.com', required: false })
  email: string;

  @ApiProperty({ example: 'Admin2025', required: false })
  senha: string;
}
