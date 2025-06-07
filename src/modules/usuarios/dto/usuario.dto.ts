import { z } from 'zod';

export const UsuarioSchema = z.object({
  id: z.string().uuid().nonempty(),
  nome: z.string().nonempty(),
  email: z.string().nonempty().email('Email inválido'),
});

export const UsuarioBuscaRes = UsuarioSchema.extend({
  senha: z.string().nonempty('Senha não informada.'),
});

export const UsuarioBuscaReq = z.object({
  email: z.string().nonempty().email('Email inválido'),
});

export const UsuarioCriarReq = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .nonempty('Nome não informado.')
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .refine((nome) => nome.split(' ').length >= 2, {
      message: 'Insira nome e sobrenome',
    }),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido, verifique as informações e tente novamente')
    .min(5, 'O e-mail deve ter no mínimo 5 caracteres')
    .max(80, 'O e-mail deve ter no máximo 80 caracteres')
    .nonempty('E-mail não informado.'),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .nonempty('Senha não informada.'),
});

export const UsuarioControllerCriar = z.object({
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

export const UsuarioAlterarReq = UsuarioControllerCriar.extend({
  lojistaId: z.string().uuid().nonempty(),
  lojistaEmail: z.string().nonempty().email('Email inválido'),
});

export type UsuarioBuscaType = z.infer<typeof UsuarioBuscaRes>;
export type UsuarioType = z.infer<typeof UsuarioSchema>;
