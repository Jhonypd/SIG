import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/common/interfaces/jwt-payload.interface';
import { Usuario } from '../usuarios/usuarios.entity';
import { Repository } from 'typeorm';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { z } from 'zod';
import { EncryptionService } from 'src/common/encryption/encryption.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly config: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {
    // Define como o JWT será extraído e a chave usada para validar a assinatura
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Validação da estratégia JWT.
   *
   * Esse método é executado automaticamente pelo Passport após a verificação da assinatura
   * do token JWT. Serve para verificar se o usuário ainda existe no sistema e retornar
   * seus dados descriptografados, que ficarão acessíveis via `@Request()` ou `@getUserToken()`.
   *
   * @param payload - Objeto extraído do token JWT. Deve conter `id`, `email`, `name`.
   * Estrutura definida por `JwtPayload`.
   *
   * @throws UnauthorizedException - Se o usuário não for encontrado no banco de dados.
   *
   * @returns JwtPayloadType - Objeto contendo `id`, `email` e `nome` do usuário, com campos descriptografados.
   */
  async validate(payload: z.infer<typeof JwtPayload>): Promise<JwtPayloadType> {
    // Verifica se o usuário ainda existe no banco
    const usuarioExiste = await this.usuarioRepository.findOne({
      where: { id: payload.id },
    });

    if (!usuarioExiste) {
      throw new UnauthorizedException({
        message: 'Usuário não encontrado',
        error: 'Acesso negado',
      });
    }

    // Retorna os dados descriptografados conforme tipagem definida no payload
    const usuario = await mapWithDecryptionDto<JwtPayloadType>(
      usuarioExiste,
      JwtPayload,
      this.encryptionService,
      ['email', 'nome'], // campos que precisam ser descriptografados
    );

    return usuario;
  }
}
