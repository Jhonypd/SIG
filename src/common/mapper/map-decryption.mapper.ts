import { z } from 'zod';
import { EncryptionService } from '../encryption/encryption.service';

/**
 *
 * @param entity entidade a ser mapeada
 * @param zodSchema esquema de validação
 * @param encryptionService serviço de criptografia
 * @param encryptedFields campos criptografados
 * @returns entidade mapeada
 */
export async function mapWithDecryptionDto<T extends Record<string, any>>(
  entity: Record<string, any>,
  schema: z.ZodType<T>,
  encryptionService: EncryptionService,
  encryptedFields: (keyof T)[] = [],
): Promise<T> {
  const decrypted: Record<string, any> = { ...entity };

  for (const field of encryptedFields) {
    const fieldValue = entity[field as string];
    if (fieldValue) {
      decrypted[field as string] = await encryptionService.decrypt(fieldValue);
    }
  }

  return schema.parse(decrypted);
}
