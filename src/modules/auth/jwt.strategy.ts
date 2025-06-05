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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: z.infer<typeof JwtPayload>) {
    const usuarioExiste = await this.usuarioRepository.findOne({
      where: { id: payload.id },
    });

    if (!usuarioExiste) {
      throw new UnauthorizedException({
        message: 'Usuário não encontrado',
        error: 'Acesso negado',
      });
    }

    const usuario = await mapWithDecryptionDto<JwtPayloadType>(
      usuarioExiste,
      JwtPayload,
      this.encryptionService,
      ['email', 'nome'],
    );

    return usuario;
  }
}
