import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'Jhony Teste' })
  name: string;

  @ApiProperty({ example: 'jhony@email.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
