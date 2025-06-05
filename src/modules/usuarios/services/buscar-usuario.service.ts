import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios.entity';
import { createHmac } from 'crypto';

@Injectable()
export class BuscarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  
  
  async execute(email: string): Promise<Usuario> {
    const hashedEmail = this.hashEmail(email);
    const usuario = await this.usuarioRepository.findOneBy({
      hashEmail: hashedEmail,
    });

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado');
    }
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
