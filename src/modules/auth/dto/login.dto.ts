import { z } from 'zod';

export const LoginDto = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .min(5, 'O email deve ter no mínimo 5 caracteres')
    .max(80, 'O email deve ter no máximo 80 caracteres')
    .email(
      'E-mail inválido, verifique se o e-mail está correto e tente novamente',
    )
    .nonempty('E-mail deve ser  informado.')
    .transform((email) => email.trim()),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .nonempty('Senha deve ser informada.'),
});
