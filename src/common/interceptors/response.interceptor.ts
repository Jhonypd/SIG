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

    this.logger.log(`➡️ ${request.method} ${request.url}`);

    return next.handle().pipe(
      map((data): StandardResponse => {
        const timeResponse = Date.now() - startTime;

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
}
