import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class CriptografiaService {
  private readonly algoritmo = 'aes-256-cbc';

  // Chave de criptografia
  private readonly chave = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  /**
   * Criptografa um texto simples usando AES-256-CBC.
   *
   * @param texto Texto em formato string que será criptografado.
   * @returns Texto criptografado no formato 'iv:conteudo'.
   */
  criptografar(texto: string): string {
    const iv = randomBytes(16); // IV com 16 bytes
    const cifrador = createCipheriv(this.algoritmo, this.chave, iv);
    const conteudoCriptografado = Buffer.concat([
      cifrador.update(texto, 'utf8'),
      cifrador.final(),
    ]);
    return `${iv.toString('hex')}:${conteudoCriptografado.toString('hex')}`;
  }

  /**
   * Descriptografa um texto criptografado previamente com AES-256-CBC.
   *
   * @param textoCriptografado Texto criptografado no formato 'iv:conteudo'.
   * @returns Texto original em formato string.
   */
  descriptografar(textoCriptografado: string): string {
    const [ivHex, conteudoHex] = textoCriptografado.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const conteudoCriptografado = Buffer.from(conteudoHex, 'hex');
    const decifrador = createDecipheriv(this.algoritmo, this.chave, iv);
    const textoOriginal = Buffer.concat([
      decifrador.update(conteudoCriptografado),
      decifrador.final(),
    ]);
    return textoOriginal.toString('utf8');
  }
}
