import { ApiProperty } from '@nestjs/swagger';

// O required "false" é para que seja possível validar
// o DTO com o ZodValidationPipe
export class LoginRequestDto {
  @ApiProperty({ example: 'jhony@email.com', required: false })
  email: string;

  @ApiProperty({ example: '123456', required: false })
  password: string;
}
