import { ApiProperty } from '@nestjs/swagger';
import { ImageCreateRequestDto } from 'src/modules/imagens/dto/criar-imagem-request.dto';
import { z } from 'zod';

// O required "false" é para que seja possível validar
// o DTO com o ZodValidationPipe
export const VeiculoSchemaDto = z.object({
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
    .optional(),
  usuario: z
    .object({
      id: z.string().optional(),
      nome: z.string().optional(),
      email: z.string(),
    })
    .optional(),
});
