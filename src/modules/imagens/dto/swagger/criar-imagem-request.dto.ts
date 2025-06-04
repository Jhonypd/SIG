import { ApiProperty } from '@nestjs/swagger';

export class CriarImagemRequestDto {
  @ApiProperty({ example: 'Corolla', description: 'Nome da imagem' })
  nome: string;

  @ApiProperty({
    example: 'https://example.com/imagem.jpg',
    description: 'URL da imagem',
  })
  url: string;
}
