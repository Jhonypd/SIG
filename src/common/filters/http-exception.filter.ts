import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReturnType, StandardResponse } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest();

    const status = this.getStatusCode(exception);
    const message = this.extractMessage(exception);
    const responseTime = Date.now() - (request.startTime || Date.now());

    const logMsg = `${request.method} ${request.url} ${status}ms`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logMsg, exception.stack);
    } else {
      this.logger.warn(logMsg);
    }

    const errorResponse: StandardResponse = {
      Result: null,
      Success: false,
      Message: message,
      Detail: exception?.response?.error ?? 'Erro inesperado',
      ReturnCode: status,
      ReturnType: this.getReturnType(status),
      ResponseTime: responseTime,
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

  private getReturnType(status: number): ReturnType {
    if (status === HttpStatus.BAD_REQUEST) return ReturnType.VALIDATION_ERROR;
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN)
      return ReturnType.AUTH_ERROR;
    if (status >= 400 && status < 500) return ReturnType.BUSINESS_ERROR;
    if (status >= 500) return ReturnType.INTERNAL_ERROR;
    return ReturnType.SUCCESS;
  }
}
