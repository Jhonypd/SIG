import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { Usuario } from '../usuarios.entity';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { BuscarUsuarioService } from './buscar-usuario.service';

@Injectable()
export class CriarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly encryptionService: EncryptionService,
    private readonly buscarUsuarioService: BuscarUsuarioService,
  ) {}

  async criar(data: z.infer<typeof RegisterDto>): Promise<Usuario> {
    const validation = RegisterDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const existingUser = await this.buscarUsuarioService.execute(data.email);

    if (existingUser) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const hashedEmail = this.hashEmail(data.email);

    const usuario = this.usuarioRepository.create({
      ...data,
      nome: this.encryptionService.encrypt(data.nome),
      email: this.encryptionService.encrypt(data.email),
      hashEmail: hashedEmail,
      senha: hashedPassword,
    });

    await this.usuarioRepository.save(usuario);

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
