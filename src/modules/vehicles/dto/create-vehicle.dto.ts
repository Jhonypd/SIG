import { z } from 'zod';

export const CreateVehicleDto = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().gte(1900),
  price: z.number().positive(),
  description: z.string().optional(),
});
