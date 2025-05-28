import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ReturnType, StandardResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> {
    const request = context.switchToHttp().getRequest();
    const startTime = request.startTime || Date.now();

    this.logger.log(`Response to ${request.method} ${request.url}`);

    return next.handle().pipe(
      map((data): StandardResponse => {
        const timeResponse = Date.now() - startTime;

        // Se já for StandardResponse,
        // verifica se o responseTime veio no data,
        // se não veio seta o timeResponse
        if (this.isStandardResponse(data)) {
          return {
            ...data,
            ResponseTime:
              data.ResponseTime && data.ResponseTime > 0
                ? data.ResponseTime
                : timeResponse,
            Message: data.Message || 'Operação realizada com sucesso',
          };
        }

        // Se a resposta não vier no padrão StandardResponse,
        //  formata e retorna
        return {
          Result: data ?? null,
          Success: true,
          Message: 'Operação realizada com sucesso',
          Detail: null,
          ReturnCode: HttpStatus.OK,
          ReturnType: ReturnType.SUCCESS,
          ResponseTime: timeResponse,
        };
      }),
    );
  }

  private isStandardResponse(data: any): data is StandardResponse {
    return (
      data &&
      typeof data === 'object' &&
      'Result' in data &&
      'Success' in data &&
      'ReturnType' in data
    );
  }
}
