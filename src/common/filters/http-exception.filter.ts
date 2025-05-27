import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ReturnType,
  StandardResponse,
} from '../interfaces/response-controllers.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest();

    const status = this.getStatusCode(exception);
    const returnType = this.determineReturnType(status);
    const { message, detail } = this.extractErrorDetails(exception);
    const responseTime = this.calculateResponseTime(request);

    // Log the error with context
    const method = request.method;
    const url = request.url;
    const user = request.user ? JSON.stringify(request.user) : 'Guest';
    const logMessage = `${method} ${url} ${status}ms - User: ${user}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logMessage, exception.stack);
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(logMessage, exception.stack);
    } else {
      this.logger.log(logMessage);
    }

    const errorResponse: StandardResponse = {
      Result: null,
      Success: false,
      Message: message,
      Detail: detail,
      ReturnCode: status,
      ReturnType: returnType,
      ResponseTime: responseTime,
    };

    response.status(status).send(errorResponse);
  }

  private getStatusCode(exception: any): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private determineReturnType(status: number): ReturnType {
    switch (true) {
      case status === HttpStatus.BAD_REQUEST:
        return ReturnType.VALIDATION_ERROR;
      case status === HttpStatus.UNAUTHORIZED:
      case status === HttpStatus.FORBIDDEN:
        return ReturnType.AUTH_ERROR;
      case status >= 400 && status < 500:
        return ReturnType.BUSINESS_ERROR;
      case status >= 500:
        return ReturnType.INTERNAL_ERROR;
      default:
        return ReturnType.SUCCESS;
    }
  }

  private extractErrorDetails(exception: any): {
    message: string;
    detail: string;
  } {
    const defaultMessage = 'Falha na operação';
    const defaultDetail = 'Erro inesperado';

    if (!(exception instanceof HttpException)) {
      return { message: defaultMessage, detail: defaultDetail };
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response, detail: response };
    }

    if (typeof response === 'object') {
      return {
        message: this.extractMessage(response),
        detail: response['error'] || defaultDetail,
      };
    }

    return { message: defaultMessage, detail: defaultDetail };
  }

  private extractMessage(response: any): string {
    if (Array.isArray(response.message)) {
      return response.message.join('; ');
    }
    return response.message || 'Falha na operação';
  }

  private calculateResponseTime(request: any): number {
    return Date.now() - (request.startTime || Date.now());
  }
}
