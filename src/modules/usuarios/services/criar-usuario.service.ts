import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { CriptografiaService } from 'src/common/encryption/criptografia.service';
import { Usuario } from '../usuarios.entity';
import { BuscarUsuarioService } from './buscar-usuario.service';
import { mapearComDescriptografia } from 'src/common/mapper/mapear-descriptografia.mapper.ts';
import {
  UsuarioSchema,
  UsuarioCriarReq,
  UsuarioType,
} from '../dto/usuario.dto';

@Injectable()
export class CriarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly criptografiaService: CriptografiaService,
    private readonly buscarUsuarioService: BuscarUsuarioService,
  ) {}

  async execute(
    data: z.infer<typeof UsuarioCriarReq>,
  ): Promise<z.infer<typeof UsuarioSchema>> {
    const existingUser = await this.buscarUsuarioService.execute({
      email: data.email,
    });

    if (existingUser) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const hashedEmail = this.hashEmail(data.email);

    const usuarioDados = this.usuarioRepository.create({
      ...data,
      nome: this.criptografiaService.criptografar(data.nome),
      email: this.criptografiaService.criptografar(data.email),
      hashEmail: hashedEmail,
      senha: hashedPassword,
    });

    const usuarioCriado = await this.usuarioRepository.save(usuarioDados);

    const usuario = await mapearComDescriptografia<UsuarioType>(
      usuarioCriado,
      UsuarioSchema,
      this.criptografiaService,
      ['email', 'nome'],
    );

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
