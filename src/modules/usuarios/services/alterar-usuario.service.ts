import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { BuscarUsuarioService } from './buscar-usuario.service';
import { Usuario } from '../usuarios.entity';
import { UsuarioSchemaDto, UsuarioType } from '../dto/usuario.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { AlterarUsuarioServiceSchemaDto } from '../dto/alterar-usuario.dto';

@Injectable()
export class AlterarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly buscarUsuarioService: BuscarUsuarioService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(
    data: z.infer<typeof AlterarUsuarioServiceSchemaDto>,
  ): Promise<z.infer<typeof UsuarioSchemaDto>> {
    const usuarioEsxistente = await this.buscarUsuarioService.execute({
      email: data.lojistaEmail,
    });

    if (!usuarioEsxistente) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (usuarioEsxistente.id !== data.lojistaId) {
      throw new BadRequestException('Email já cadastrado para outro usuário');
    }

    const dadosAtualizacao: Partial<Usuario> = {};

    // Se vier email, trata a atualização
    if (data.dadosAlteracao.email) {
      dadosAtualizacao.email = this.encryptionService.encrypt(
        data.dadosAlteracao.email,
      );
      dadosAtualizacao.hashEmail = this.hashEmail(data.dadosAlteracao.email);
    }

    // Se vier senha, trata a atualização
    if (data.dadosAlteracao.senha) {
      const senhaRepetida = await bcrypt.compare(
        data.dadosAlteracao.senha,
        usuarioEsxistente.senha,
      );

      if (senhaRepetida) {
        throw new BadRequestException('Escolha uma senha diferente da atual');
      }

      dadosAtualizacao.senha = await bcrypt.hash(data.dadosAlteracao.senha, 10);
    }

    if (Object.keys(dadosAtualizacao).length === 0) {
      throw new BadRequestException('Nenhum dado de alteração foi fornecido');
    }

    await this.usuarioRepository.update(usuarioEsxistente.id, dadosAtualizacao);

    const usuarioAtualizado = await this.usuarioRepository.findOneByOrFail({
      id: usuarioEsxistente.id,
    });

    return await mapWithDecryptionDto<UsuarioType>(
      usuarioAtualizado,
      UsuarioSchemaDto,
      this.encryptionService,
      ['email', 'nome'],
    );
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
