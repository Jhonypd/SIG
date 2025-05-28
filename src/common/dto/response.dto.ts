import { ApiProperty } from '@nestjs/swagger';

export enum ReturnType {
  SUCCESS = 1,
  BUSINESS_ERROR = 2,
  VALIDATION_ERROR = 3,
  AUTH_ERROR = 4,
  INTERNAL_ERROR = 5,
}

export class StandardResponseDto {
  @ApiProperty({
    nullable: true,
    description: 'Resultado da operação',
    type: Object,
  })
  Result: object | null;

  @ApiProperty({ description: 'Indica sucesso ou falha' })
  Success: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Mensagem resumida',
    type: String,
  })
  Message: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Detalhes adicionais',
    type: String,
  })
  Detail: string | null;

  @ApiProperty({ description: 'Código de retorno da operação' })
  ReturnCode: number;

  @ApiProperty({ enum: ReturnType, description: 'Tipo do retorno' })
  ReturnType: ReturnType;

  @ApiProperty({ description: 'Tempo de resposta em milissegundos' })
  ResponseTime: number;
}
