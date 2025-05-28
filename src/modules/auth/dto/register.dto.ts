import { z } from 'zod';

export const RegisterDto = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .nonempty('Nome é obrigatório'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido, verifique as informações e tente novamente')
    .min(5, 'O e-mail deve ter no mínimo 5 caracteres')
    .max(80, 'O e-mail deve ter no máximo 80 caracteres')
    .nonempty('E-mail é obrigatório'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .nonempty('Senha é obrigatória'),
});
