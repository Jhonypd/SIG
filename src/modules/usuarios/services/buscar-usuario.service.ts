import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios.entity';
import { createHmac } from 'crypto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { z } from 'zod';
import { UsuarioSchemaDto, UsuarioSchemaResponseDto } from '../dto/usuario.dto';
import { BuscarUsuarioSchemaDto } from '../dto/buscar-usuario.dto';

@Injectable()
export class BuscarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async execute(
    data: z.infer<typeof BuscarUsuarioSchemaDto>,
  ): Promise<z.infer<typeof UsuarioSchemaResponseDto> | null> {
    const hashedEmail = this.hashEmail(data.email);

    const usuario = await this.usuarioRepository.findOneBy({
      hashEmail: hashedEmail,
    });

    return usuario;
  }

  private hashEmail(email: string) {
    const secret = process.env.HASH_SECRET;

    if (!email) {
      throw new BadRequestException('Valor invalido para gerar o hash');
    }
    if (!secret) {
      throw new BadRequestException('HASH_SECRET não configurado');
    }
    return createHmac('sha256', secret).update(email).digest('hex');
  }
}
