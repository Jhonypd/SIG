import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  ReturnType,
  StandardResponse,
} from '../interfaces/response-controllers.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> {
    const request = context.switchToHttp().getRequest();
    const startTime = request.startTime || Date.now();
    this.logger.log(`Interceptando request: ${request}`);
    return next.handle().pipe(
      map((data): StandardResponse => {
        const timeResponse = Date.now() - startTime;
        this.logger.log(`Interceptando data: ${data}`);
        // Se a resposta já estiver no formato ResponseDto, retorna ela mesma
        if (this.isStandardResponse(data)) {
          if (!data.ResponseTime || data.ResponseTime === 0) {
            return {
              ...data,
              ResponseTime: timeResponse,
              Message: data.Message
                ? data.Message
                : 'Operação realizada com sucesso',
            };
          }

          return data;
        }

        // Caso contrário, formata a resposta
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
