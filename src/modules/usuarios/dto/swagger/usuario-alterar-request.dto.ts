import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AlterarUsuarioSwaggerDto {
  @ApiPropertyOptional({
    description: 'Novo email do usuário',
    example: 'usuario@dominio.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nova senha do usuário',
    example: 'Senha123',
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(100, { message: 'A senha deve ter no máximo 100 caracteres' })
  @Matches(/[A-Z]/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/[a-z]/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/[0-9]/, {
    message: 'A senha deve conter pelo menos um número',
  })
  senha?: string;
}

export class AlterarUsuarioRequestDto {
  @ApiPropertyOptional({
    description: 'Dados que serão alterados no usuário',
    type: AlterarUsuarioSwaggerDto,
  })
  @IsOptional()
  dadosAlteracao?: AlterarUsuarioSwaggerDto;
}
