import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

// DTO para o Swagger
export class FilterVehicleDto {
  @ApiPropertyOptional({
    example: 'Toyota',
    description: 'Marca do veículo para filtro',
  })
  brand?: string;

  @ApiPropertyOptional({
    example: 'Corolla',
    description: 'Modelo do veículo para filtro',
  })
  model?: string;

  @ApiPropertyOptional({
    example: 2010,
    description: 'Ano mínimo de fabricação do veículo',
  })
  minYear?: number;

  @ApiPropertyOptional({
    example: 2023,
    description: 'Ano máximo de fabricação do veículo',
  })
  maxYear?: number;

  @ApiPropertyOptional({
    example: 20000,
    description: 'Preço mínimo do veículo em R$',
  })
  minPrice?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Preço máximo do veículo em R$',
  })
  maxPrice?: number;

  @ApiPropertyOptional({
    example: '4 portas',
    description: 'Palavra-chave para busca geral (marca, modelo, descrição)',
  })
  keyword?: string;
}
