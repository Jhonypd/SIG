import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { RegisterDto } from '../auth/dto/register.dto';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { Usuario } from './usuarios.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async buscarTodos(): Promise<RespostaPadrao<Usuario[]>> {
    const usuarios = await this.usuarioRepository.find();

    return {
      Resultado: usuarios,
      Sucesso: true,
      Mensagem: null,
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
  async criar(
    data: z.infer<typeof RegisterDto>,
  ): Promise<RespostaPadrao<Usuario>> {
    const validation = RegisterDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const existingUser = await this.buscarUsuario(data.email);

    if (existingUser.Resultado)
      throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const hashedEmail = this.hashEmail(data.email);

    const user = this.usuarioRepository.create({
      ...data,
      nome: this.encryptionService.encrypt(data.nome),
      email: this.encryptionService.encrypt(data.email),
      hashEmail: hashedEmail,
      senha: hashedPassword,
    });

    await this.usuarioRepository.save(user);

    return {
      Resultado: user,
      Sucesso: true,
      Mensagem: 'Usuário cadastrado com sucesso',
      Detalhe: null,
      CodigoRetorno: 201,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
  async buscarUsuario(email: string): Promise<RespostaPadrao<Usuario>> {
    const hashedEmail = this.hashEmail(email);
    const user = await this.usuarioRepository.findOneBy({
      hashEmail: hashedEmail,
    });

    return {
      Resultado: user,
      Sucesso: true,
      Mensagem: null,
      Detalhe: null,
      CodigoRetorno: 201,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
  async delete(id: string): Promise<RespostaPadrao<Usuario>> {
    const user = await this.buscarPorId(id);

    if (!user.Resultado) {
      throw new BadRequestException('Usuário não encontrado');
    }

    await this.usuarioRepository.remove(user.Resultado);

    return {
      Resultado: null,
      Sucesso: true,
      Mensagem: 'Usuário excluído com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }

  async buscarPorId(id: string): Promise<RespostaPadrao<Usuario>> {
    const user = await this.usuarioRepository.findOneBy({
      id: id,
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return {
      Resultado: user,
      Sucesso: true,
      Mensagem: null,
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }

  async update(
    id: string,
    data: Partial<Usuario>,
  ): Promise<RespostaPadrao<Usuario>> {
    const user = await this.buscarPorId(id);

    if (!user.Resultado) {
      throw new BadRequestException('Usuário não encontrado');
    }

    await this.usuarioRepository.update(id, data);

    return {
      Resultado: { ...user.Resultado, ...data },
      Sucesso: true,
      Mensagem: 'Usuário atualizado com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
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
