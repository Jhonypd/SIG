import { z } from 'zod';

export const AtualizaVeiculoDto = z.object({
  veiculoId: z.string().uuid({ message: 'Id em formato inválido' }),
  veiculo: z.object({
    marca: z
      .string({ message: 'Apenas texto' })
      .min(3, 'Marca deve ter pelo menos 3 caracteres'),
    modelo: z
      .string({ message: 'Apenas texto' })
      .min(2, 'Modelo deve ter pelo menos 2 caracteres'),
    ano: z
      .number({ message: 'Apenas números são aceitos no ano' })
      .int({ message: 'O preço deve ser maior que zero' })
      .gte(1900)
      .lte(new Date().getFullYear() + 1),
    preco: z
      .number({ message: 'Apenas números são aceitos no preço' })
      .positive({ message: 'O preço deve ser maior que zero' }),
    descricao: z.string({ message: 'Apenas texto' }).optional(),

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
  }),
});
