import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'jhony@email.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
