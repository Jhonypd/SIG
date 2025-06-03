import { z } from 'zod';

export const FiltroVeiculoSchemaDto = z
  .object({
    marca: z
      .string()
      .min(2, 'Marca deve ter pelo menos 2 caracteres')
      .optional(),
    modelo: z
      .string()
      .min(2, 'Modelo deve ter pelo menos 2 caracteres')
      .optional(),
    minAno: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    maxAno: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    minPreco: z.coerce
      .number()
      .min(0, 'Preço mínimo não pode ser negativo')
      .optional(),
    maxPreco: z.coerce
      .number()
      .min(0, 'Preço máximo não pode ser negativo')
      .optional(),
    palavrasChave: z.string().optional(),

    pagina: z.coerce.number().min(0).default(0),
    limite: z.coerce.number().min(1).max(100).default(20),
  })
  .refine(
    (data) => {
      if (data.minAno && data.maxAno) {
        return data.minAno <= data.maxAno;
      }
      return true;
    },
    {
      message: 'Ano mínimo não pode ser maior que o ano máximo',
      path: ['minAno'],
    },
  )
  .refine(
    (data) => {
      if (data.minPreco && data.maxPreco) {
        return data.minPreco <= data.maxPreco;
      }
      return true;
    },
    {
      message: 'Preço mínimo não pode ser maior que o preço máximo',
      path: ['minPreco'],
    },
  );
