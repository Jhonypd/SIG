import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { TipoRetorno, RespostaPadrao } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RespostaPadrao> {
    const request = context.switchToHttp().getRequest();
    const startTime = request.startTime || Date.now();

    this.logger.log(`Response to ${request.method} ${request.url}`);

    return next.handle().pipe(
      map((data): RespostaPadrao => {
        const timeResponse = Date.now() - startTime;

        // Se já for RespostaPadrao,
        // verifica se o tempoResposta veio no data,
        // se não veio seta o timeResponse
        if (this.isStandardResponse(data)) {
          return {
            ...data,
            TempoResposta:
              data.TempoResposta && data.TempoResposta > 0
                ? data.TempoResposta
                : timeResponse,
            Mensagem: data.Mensagem || 'Operação realizada com sucesso',
          };
        }

        // Se a resposta não vier no padrão RespostaPadrao,
        //  formata e retorna
        return {
          Resultado: data ?? null,
          Sucesso: true,
          Mensagem: 'Operação realizada com sucesso',
          Detalhe: null,
          CodigoRetorno: HttpStatus.OK,
          TipoRetorno: TipoRetorno.RESPOSTA_SUCESSO,
          TempoResposta: timeResponse,
        };
      }),
    );
  }

  private isStandardResponse(data: any): data is RespostaPadrao {
    return (
      data &&
      typeof data === 'object' &&
      'Resultado' in data &&
      'Sucesso' in data &&
      'TipoRetorno' in data
    );
  }
}
