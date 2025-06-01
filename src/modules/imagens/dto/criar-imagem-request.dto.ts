import { ApiProperty } from '@nestjs/swagger';

// O required "false" é para que seja possível validar
// o DTO com o ZodValidationPipe
export class ImageCreateRequestDto {
  // @ApiProperty({ type: String, example: 'Nome da Imagem', required: false })
  // vehicleId: string;

  // @ApiProperty({ type: String, example: 'Nome da Imagem', required: false })
  // name: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/imagem.jpg',
    required: false,
  })
  url: string;
}
