import { z } from 'zod';

export const FilterVehicleDtoSchema = z
  .object({
    marca: z
      .string()
      .min(2, 'Marca deve ter pelo menos 2 caracteres')
      .optional(),
    modelo: z
      .string()
      .min(2, 'Modelo deve ter pelo menos 2 caracteres')
      .optional(),
    minAno: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    maxAno: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    minPreco: z
      .number()
      .min(0, 'Preço mínimo não pode ser negativo')
      .optional(),
    maxPreco: z
      .number()
      .min(0, 'Preço máximo não pode ser negativo')
      .optional(),
    palavrasChave: z.string().optional(),
    lojistaId: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.minPreco && data.maxPreco) {
        return data.minPreco <= data.maxPreco;
      }
      return true;
    },
    {
      message: 'Preço mínimo não pode ser maior que o preço máximo',
      path: ['minPrice'],
    },
  );
