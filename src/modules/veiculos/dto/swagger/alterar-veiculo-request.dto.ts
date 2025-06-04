import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CriarImagemRequestDto } from 'src/modules/imagens/dto/swagger/criar-imagem-request.dto';
import { ImagemExcluirDto } from 'src/modules/imagens/dto/swagger/exclui-imagem-request.dto';

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

  @ApiProperty({ example: 85000, minimum: 1 })
  preco: number;

  @ApiPropertyOptional({ example: 'Veículo em excelente estado, único dono' })
  descricao?: string;

  @ApiProperty({ type: [CriarImagemRequestDto], required: false })
  imagensIncluir: CriarImagemRequestDto[];

  @ApiProperty({ type: [ImagemExcluirDto], required: false })
  imagensExcluir: ImagemExcluirDto[];
}

export class AtualizaVeiculoRequestDto {
  @ApiProperty({ example: 'uuid', description: 'ID do veículo' })
  veiculoId: string;

  @ApiProperty({ type: VeiculoAtualizaDto })
  veiculo: VeiculoAtualizaDto;
}
