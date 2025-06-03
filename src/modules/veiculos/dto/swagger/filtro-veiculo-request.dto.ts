import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltroVeiculoRequestDto {
  @ApiPropertyOptional({
    example: 'Toyota',
    minLength: 2,
    description: 'Marca do veículo (mínimo 2 caracteres)',
  })
  marca?: string;

  @ApiPropertyOptional({
    example: 'Corolla',
    minLength: 2,
    description: 'Modelo do veículo (mínimo 2 caracteres)',
  })
  modelo?: string;

  @ApiPropertyOptional({
    example: 2010,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    description: 'Ano mínimo do veículo',
  })
  minAno?: number;

  @ApiPropertyOptional({
    example: 2023,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    description: 'Ano máximo do veículo',
  })
  maxAno?: number;

  @ApiPropertyOptional({
    example: 20000,
    minimum: 0,
    description: 'Preço mínimo',
  })
  minPreco?: number;

  @ApiPropertyOptional({
    example: 100000,
    minimum: 0,
    description: 'Preço máximo',
  })
  maxPreco?: number;

  @ApiPropertyOptional({
    example: '4 portas automático',
    description: 'Palavras-chave presentes na descrição do veículo',
  })
  palavrasChave?: string;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    default: 0,
    description: 'Número da página (começa em 0)',
  })
  pagina?: number;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Número de itens por página',
  })
  limite?: number;
}
