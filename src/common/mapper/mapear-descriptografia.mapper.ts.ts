import { z } from 'zod';
import { CriptografiaService } from '../encryption/criptografia.service';

/**
 * Mapeia e descriptografa os campos sensíveis de uma entidade.
 *
 * @param entidade Objeto original com possíveis campos criptografados.
 * @param esquemaZod Esquema Zod para validação e tipagem.
 * @param servicoCriptografia Serviço responsável pela descriptografia.
 * @param camposCriptografados Lista de chaves que devem ser descriptografadas.
 * @returns Objeto validado e com campos sensíveis descriptografados.
 */
export async function mapearComDescriptografia<T extends Record<string, any>>(
  entidade: Record<string, any>,
  esquemaZod: z.ZodType<T>,
  servicoCriptografia: CriptografiaService,
  camposCriptografados: (keyof T)[] = [],
): Promise<T> {
  // Cria uma cópia da entidade original
  const entidadeDescriptografada: Record<string, any> = { ...entidade };

  // Para cada campo listado, aplica a descriptografia se existir valor
  for (const campo of camposCriptografados) {
    const valor = entidade[campo as string];
    if (valor) {
      entidadeDescriptografada[campo as string] =
        await servicoCriptografia.descriptografar(valor);
    }
  }

  // Retorna o objeto após validação com Zod
  return esquemaZod.parse(entidadeDescriptografada);
}
