import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    const resultado = this.schema.safeParse(value);
    if (!resultado.success) {
      throw new BadRequestException(
        resultado.error.errors.map((err) => err.message),
      );
    }

    return resultado.data;
  }
}
