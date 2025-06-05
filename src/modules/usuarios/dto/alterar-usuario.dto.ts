import { z } from 'zod';

export const AlterarUsuarioControllerSchemaDto = z.object({
  dadosAlteracao: z.object({
    email: z.string().nonempty().email('Email inválido').optional(),
    senha: z
      .string({ required_error: 'Senha é obrigatória' })
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .max(100, 'A senha deve ter no máximo 100 caracteres')
      .nonempty('Senha não informada.')
      .optional(),
  }),
});

export const AlterarUsuarioServiceSchemaDto =
  AlterarUsuarioControllerSchemaDto.extend({
    lojistaId: z.string().uuid().nonempty(),
    lojistaEmail: z.string().nonempty().email('Email inválido'),
  });
