import { ApiProperty } from '@nestjs/swagger';

export class CriarImagemRequestDto {
  @ApiProperty({
    example: 'https://example.com/imagem.jpg',
    description: 'URL da imagem',
  })
  url: string;
}
