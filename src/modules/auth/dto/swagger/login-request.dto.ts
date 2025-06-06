import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'jhony@email.com', required: false })
  email: string;

  @ApiProperty({ example: 'Admin2025', required: false })
  senha: string;
}
