import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TipoRetorno, RespostaPadrao } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest();

    const status = this.getStatusCode(exception);
    const mensagem = this.extractMessage(exception);
    const tempoResposta = Date.now() - (request.startTime || Date.now());

    const logMsg = `${request.method} ${request.url} ${status}ms`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logMsg, exception.stack);
    } else {
      this.logger.warn(logMsg);
    }

    const errorResponse: RespostaPadrao = {
      Resultado: null,
      Sucesso: false,
      Mensagem: mensagem,
      Detalhe: exception?.response?.error ?? 'Erro inesperado',
      CodigoRetorno: status,
      TipoRetorno: this.getReturnType(status),
      TempoResposta: tempoResposta,
    };

    response.status(status).send(errorResponse);
  }

  private getStatusCode(exception: any): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractMessage(exception: any): string {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') return res;

      if (typeof res === 'object') {
        const message = (res as Record<string, any>).message;
        if (Array.isArray(message)) return message.join('; ');
        return message || 'Falha na operação';
      }
    }
    return 'Falha na operação';
  }

  private getReturnType(status: number): TipoRetorno {
    if (status === HttpStatus.BAD_REQUEST) return TipoRetorno.ERRO_VALIDACAO;
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN)
      return TipoRetorno.ERRO_AUTENTICACAO;
    if (status >= 400 && status < 500) return TipoRetorno.ERRO_NEGOCIO;
    if (status >= 500) return TipoRetorno.ERRO_INTERNO_SERVIDOR;
    return TipoRetorno.RESPOSTA_SUCESSO;
  }
}
