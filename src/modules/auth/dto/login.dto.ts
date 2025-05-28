import { z } from 'zod';

export const LoginDto = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .min(5, 'O email deve ter no mínimo 5 caracteres')
    .max(80, 'O email deve ter no máximo 80 caracteres')
    .email('E-mail inválido')
    .nonempty('E-mail é obrigatório')
    .transform((email) => email.trim()),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .nonempty('Senha é obrigatória'),
});
