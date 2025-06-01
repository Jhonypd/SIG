import { z } from 'zod';

export const CriarImagemDto = z.object({
  nome: z
    .string({
      message: 'Nome da imagem inválido, digite um valor válido',
    })
    .min(2, 'O nome da imagem deve ter no mínimo 3 caracteres')
    .max(100, 'O nome da imagem deve ter no máximo 100 caracteres')
    .nonempty('Nome da imagem não informado.')
    .transform((name) => name.trim().replace(/\s+/g, ' ')),
  url: z
    .string({ message: 'URL da imagem é obrigatória' })
    .url('URL inválida, verifique se a URL está correta e tente novamente')
    .nonempty('URL da imagem não informada.'),
  veiculoId: z
    .string({ message: 'Id do veículo inválido, digite um valor válido' })
    .nonempty('ID do veículo não informado.')
    .uuid('ID do veículo inválido'),
});
