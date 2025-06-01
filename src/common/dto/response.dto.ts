import { ApiProperty } from '@nestjs/swagger';

export enum TipoRetorno {
  RESPOSTA_SUCESSO = 1,
  ERRO_NEGOCIO = 2,
  ERRO_VALIDACAO = 3,
  ERRO_AUTENTICACAO = 4,
  ERRO_INTERNO_SERVIDOR = 5,
}

export class RespostaPadraoDto {
  @ApiProperty({
    nullable: true,
    description: 'Resultado da operação',
    type: Object,
  })
  Resultado: object | null;

  @ApiProperty({ description: 'Indica sucesso ou falha' })
  Sucesso: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Mensagem resumida',
    type: String,
  })
  Mensagem: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Detalhes adicionais',
    type: String,
  })
  Detalhe: string | null;

  @ApiProperty({ description: 'Código de retorno da operação' })
  CodigoRetorno: number;

  @ApiProperty({ enum: TipoRetorno, description: 'Tipo do retorno' })
  TipoRetorno: TipoRetorno;

  @ApiProperty({ description: 'Tempo de resposta em milissegundos' })
  TempoResposta: number;
}
