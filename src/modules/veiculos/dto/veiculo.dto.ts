import { ImagemSchema } from 'src/modules/imagens/dto/criar-imagem.dto';
import { UsuarioSchema } from 'src/modules/usuarios/dto/usuario.dto';
import { z } from 'zod';

export const VeiculoSchema = z.object({
  id: z.string({ required_error: 'ID é obrigatório' }).uuid('ID inválido'),
  marca: z
    .string({ required_error: 'Marca é obrigatória' })
    .min(1, 'Marca não pode ser vazia'),
  modelo: z
    .string({ required_error: 'Modelo é obrigatório' })
    .min(1, 'Modelo não pode ser vazio'),
  ano: z
    .number({ required_error: 'Ano é obrigatório' })
    .int('O ano deve ser um número inteiro')
    .gte(1900, 'Ano inválido')
    .lte(new Date().getFullYear() + 1, 'Ano inválido'),
  preco: z
    .number({ required_error: 'Preço é obrigatório' })
    .positive('O preço deve ser maior que zero'),
  descricao: z.string().optional(),
  imagens: z
    .array(
      z.object({
        id: z.string().optional(),
        nome: z.string().optional(),
        url: z
          .string({ required_error: 'URL é obrigatória' })
          .url('URL inválida'),
        veiculoId: z.string().uuid().optional(),
      }),
    )
    .optional()
    .default([]),
  usuario: UsuarioSchema,
});

export const VeiculoCriarReq = z.object({
  veiculo: VeiculoSchema.omit({ imagens: true, usuario: true, id: true }),
  imagens: z.array(ImagemSchema.pick({ url: true })).optional(),
});

export const AtualizaVeiculoDto = z.object({
  veiculoId: z.string().uuid({ message: 'Id em formato inválido' }),
  veiculo: VeiculoSchema.omit({ imagens: true, usuario: true, id: true }),

  imagensIncluir: z
    .array(
      z.object({
        url: z.string().url({ message: 'URL inválida' }),
      }),
    )
    .optional()
    .default([]),
  imagensExcluir: z
    .array(z.string().uuid({ message: 'Id da imagem em formato inválido' }))
    .optional()
    .default([]),
});

export const VeiculoBuscaReq = z.object({
  veiculoId: z
    .string({ required_error: 'Id do veiculo é obrigatório' })
    .uuid('Id com formato inválido'),
  usuarioId: z
    .string({ required_error: 'Id do usuário é obrigatório' })
    .uuid('Id com formato inválido'),
});

export const VeiculosFiltroReq = z
  .object({
    marca: z
      .string()
      .min(2, 'Marca deve ter pelo menos 2 caracteres')
      .optional(),
    modelo: z
      .string()
      .min(2, 'Modelo deve ter pelo menos 2 caracteres')
      .optional(),
    minAno: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    maxAno: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    minPreco: z.coerce
      .number()
      .min(0, 'Preço mínimo não pode ser negativo')
      .optional(),
    maxPreco: z.coerce
      .number()
      .min(0, 'Preço máximo não pode ser negativo')
      .optional(),
    palavrasChave: z.string().optional(),

    pagina: z.coerce.number().min(0).default(0),
    limite: z.coerce.number().min(1).max(100).default(20),
  })
  .refine(
    (data) => {
      if (data.minAno && data.maxAno) {
        return data.minAno <= data.maxAno;
      }
      return true;
    },
    {
      message: 'Ano mínimo não pode ser maior que o ano máximo',
      path: ['minAno'],
    },
  )
  .refine(
    (data) => {
      if (data.minPreco && data.maxPreco) {
        return data.minPreco <= data.maxPreco;
      }
      return true;
    },
    {
      message: 'Preço mínimo não pode ser maior que o preço máximo',
      path: ['minPreco'],
    },
  );
