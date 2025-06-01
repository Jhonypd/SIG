import { ApiProperty } from '@nestjs/swagger';
import { ImageCreateRequestDto } from 'src/modules/imagens/dto/criar-imagem-request.dto';

// O required "false" é para que seja possível validar
// o DTO com o ZodValidationPipe
export class CriarVeiculoRequestDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Marca do veículo',
    required: false,
  })
  marca: string;

  @ApiProperty({
    example: 'Corolla',
    description: 'Modelo do veículo',
    required: false,
  })
  modelo: string;

  @ApiProperty({
    example: 2023,
    description: 'Ano de fabricação do veículo',
    required: false,
  })
  ano: number;

  @ApiProperty({
    example: 85000.5,
    description: 'Preço do veículo em R$',
    required: false,
  })
  preco: number;

  @ApiProperty({
    example: 'Veículo em excelente estado, único dono',
    description: 'Descrição adicional do veículo',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'URL da imagem do veículo',
    required: false,
    isArray: true,
    type: ImageCreateRequestDto,
  })
  imagens?: ImageCreateRequestDto[];
}
