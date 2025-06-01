import { z } from 'zod';

export const FilterVehicleDtoSchema = z
  .object({
    brand: z
      .string()
      .min(2, 'Marca deve ter pelo menos 2 caracteres')
      .optional(),
    model: z
      .string()
      .min(2, 'Modelo deve ter pelo menos 2 caracteres')
      .optional(),
    minYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    maxYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    minPrice: z
      .number()
      .min(0, 'Preço mínimo não pode ser negativo')
      .optional(),
    maxPrice: z
      .number()
      .min(0, 'Preço máximo não pode ser negativo')
      .optional(),
    keyword: z.string().optional(), // Para busca geral (marca, modelo, descrição)
  })
  .refine(
    (data) => {
      // Valida se minPrice <= maxPrice quando ambos existem
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Preço mínimo não pode ser maior que o preço máximo',
      path: ['minPrice'],
    },
  );
