import { CriarImagemDto } from 'src/modules/imagens/dto/criar-imagem.dto';
import { z } from 'zod';

export const AtualizaVeiculoDto = z.object({
  lojistaId: z.string().uuid({ message: 'Id em formato inválido' }),
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

    imagensIncluir: z.array(CriarImagemDto.shape.url),
    imagensExcluir: z.array(
      z.object({ id: z.string().uuid({ message: 'Id em formato inválido' }) }),
    ),
  }),
});
