import { z } from 'zod';

export const UsuarioSchemaDto = z.object({
  id: z.string().uuid(),
  nome: z.string().nonempty(),
  email: z.string().nonempty().email('Email inválido'),
});

export type UsuarioType = z.infer<typeof UsuarioSchemaDto>;

export const UsuarioSchemaResponseDto = UsuarioSchemaDto.extend({
  senha: z.string().nonempty('Senha não informada.'),
});
