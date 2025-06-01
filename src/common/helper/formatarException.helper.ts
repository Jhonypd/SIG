import { BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

export function formatException(error: any): string | string[] {
  if (error instanceof BadRequestException) {
    const response = error.getResponse();

    if (response instanceof ZodError) {
      return response.issues.map((e) => e.message);
    }

    return JSON.stringify(response, null, 2);
  }

  if (error instanceof ZodError) {
    return error.issues.map((e) => e.message);
  }

  if (typeof error.mensagem === 'string') {
    return error.mensagem;
  }

  if (typeof error.mensagem === 'object') {
    return JSON.stringify(error.mensagem, null, 2);
  }

  return JSON.stringify(error, null, 2);
}
