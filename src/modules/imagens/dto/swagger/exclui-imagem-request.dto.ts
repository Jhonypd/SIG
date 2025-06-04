import { ApiProperty } from '@nestjs/swagger';

export class ImagemExcluirDto {
  @ApiProperty({ example: 'uuid', description: 'ID da imagem a ser excluída' })
  id: string;
}
