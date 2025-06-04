import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltroVeiculoRequestDto {
  @ApiProperty({
    minLength: 2,
    required: false,
  })
  marca?: string;

  @ApiProperty({
    minLength: 2,
    required: false,
  })
  modelo?: string;

  @ApiProperty({
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    required: false,
  })
  @Type(() => Number)
  minAno?: number;

  @ApiProperty({
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    required: false,
  })
  @Type(() => Number)
  maxAno?: number;

  @ApiProperty({
    minimum: 0,
    required: false,
  })
  @Type(() => Number)
  minPreco?: number;

  @ApiProperty({
    minimum: 0,
    required: false,
  })
  @Type(() => Number)
  maxPreco?: number;

  @ApiProperty({
    required: false,
  })
  palavrasChave?: string;

  @ApiProperty({
    minimum: 0,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  pagina?: number;

  @ApiProperty({
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  limite?: number;
}
