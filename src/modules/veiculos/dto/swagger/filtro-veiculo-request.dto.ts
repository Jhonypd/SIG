import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltroVeiculoRequestDto {
  @ApiProperty({
    example: 'Toyota',
    minLength: 2,
    required: false,
  })
  marca?: string;

  @ApiProperty({
    example: 'Corolla',
    minLength: 2,
    required: false,
  })
  modelo?: string;

  @ApiProperty({
    example: 2010,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    required: false,
  })
  @Type(() => Number)
  minAno?: number;

  @ApiProperty({
    example: 2023,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    required: false,
  })
  @Type(() => Number)
  maxAno?: number;

  @ApiProperty({
    example: 20000,
    minimum: 0,
    required: false,
  })
  @Type(() => Number)
  minPreco?: number;

  @ApiProperty({
    example: 100000,
    minimum: 0,
    required: false,
  })
  @Type(() => Number)
  maxPreco?: number;

  @ApiProperty({
    example: '4 portas automático',
    required: false,
  })
  palavrasChave?: string;

  @ApiProperty({
    example: 0,
    minimum: 0,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  pagina?: number;

  @ApiProperty({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  limite?: number;
}
