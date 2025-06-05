import { z } from 'zod';

export const BuscarUsuarioSchemaDto = z.object({
  // id: z.string().uuid().optional(),
  email: z.string().nonempty().email('Email inválido'),
});
