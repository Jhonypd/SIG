import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RespostaPadrao, TipoRetorno } from '../interfaces/response.interface';

export function handleError<T>(error: any): RespostaPadrao<T> {
  let statusCode = 500;
  let tipoRetorno = TipoRetorno.ERRO_INTERNO_SERVIDOR;
  let message = 'Ocorreu um erro interno';

  new Logger(handleError.name).error(error);

  if (error instanceof BadRequestException) {
    statusCode = error.getStatus();
    tipoRetorno = TipoRetorno.ERRO_VALIDACAO;
    message = error.message;
  } else if (error instanceof UnauthorizedException) {
    statusCode = error.getStatus();
    tipoRetorno = TipoRetorno.ERRO_AUTENTICACAO;
    message = error.message;
  }

  return {
    Resultado: null as unknown as T,
    Sucesso: false,
    Mensagem: message,
    Detalhe: process.env.NODE_ENV === 'development' ? error.message : null,
    CodigoRetorno: statusCode,
    TipoRetorno: tipoRetorno,
    TempoResposta: 0,
  };
}
