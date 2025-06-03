import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    console.log('Validando com Zod:', value);
    const resultado = this.schema.safeParse(value);
    if (!resultado.success) {
      throw new BadRequestException(
        resultado.error.errors.map(
          (err) => `${err.path}: ${err.message}` || err.message,
        ),
      );
    }

    return resultado.data;
  }
}
