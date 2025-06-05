import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CriarImagemRequestDto } from 'src/modules/imagens/dto/swagger/criar-imagem-request.dto';


class VeiculoAtualizaDto {
  @ApiProperty({ example: 'Toyota', minLength: 3 })
  marca: string;

  @ApiProperty({ example: 'Corolla', minLength: 2 })
  modelo: string;

  @ApiProperty({
    example: 2024,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
  })
  ano: number;

  @ApiProperty({ example: 85000, minimum: 1, maximum: 999999 })
  preco: number;

  @ApiPropertyOptional({ example: 'Veículo em excelente estado, único dono' })
  descricao?: string;

  @ApiProperty({ type: [CriarImagemRequestDto], required: false })
  imagensIncluir: CriarImagemRequestDto[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs das imagens que devem ser removidas',
    example: [
      'c27bba88-02dd-491d-93b2-e068cd314486',
      'b77cfa01-a51d-4df3-a4b4-fbcb2fd3c9d1',
    ],
  })
  imagensExcluir?: string[];
}

export class AtualizaVeiculoRequestDto {
  @ApiProperty({ example: 'c27bba88-02dd-491d-93b2-e068cd314486', description: 'ID do veículo' })
  veiculoId: string;

  @ApiProperty({ type: VeiculoAtualizaDto })
  veiculo: VeiculoAtualizaDto;
}
