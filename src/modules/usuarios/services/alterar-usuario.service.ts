import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { Usuario } from '../usuarios.entity';
import {
  UsuarioAlterarReq,
  UsuarioSchema,
  UsuarioType,
} from '../dto/usuario.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';

@Injectable()
export class AlterarUsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Atualiza dados sensíveis de um usuário autenticado, como e-mail e senha.
   *
   * @param data - Objeto contendo:
   *   - lojistaId: ID do usuário autenticado.
   *   - lojistaEmail: e-mail atual do usuário (para validação).
   *   - dadosAlteracao: novos valores de e-mail e/ou senha.
   *
   * @returns Dados atualizados do usuário, já descriptografados e validados.
   *
   * @throws BadRequestException:
   *   - Se o usuário não for encontrado.
   *   - Se o e-mail informado estiver em uso por outro usuário.
   *   - Se o novo e-mail ou senha forem iguais aos atuais.
   *   - Se nenhum dado de alteração for enviado.
   */

  async execute(
    data: z.infer<typeof UsuarioAlterarReq>,
  ): Promise<z.infer<typeof UsuarioSchema>> {
    // Busca o usuário pelo id informado
    const usuarioExistente = await this.usuarioRepository.findOneBy({
      id: data.lojistaId,
    });

    if (!usuarioExistente) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const dadosAtualizacao: Partial<Usuario> = {};

    // Garante que o e-mail informado pertence ao usuário autenticado
    const hashEmailRequest = this.hashEmail(data.lojistaEmail);
    if (usuarioExistente.hashEmail !== hashEmailRequest) {
      throw new BadRequestException('Ação não autorizada para este usuário');
    }

    // Se um novo e-mail foi informado, trata a validação e atualização
    if (data.dadosAlteracao.email) {
      const novoHashEmail = this.hashEmail(data.dadosAlteracao.email);

      // Se o novo e-mail é o mesmo do atual, rejeita a alteração
      if (novoHashEmail === usuarioExistente.hashEmail) {
        throw new BadRequestException('Escolha um e-mail diferente do atual');
      }

      // Verifica se o e-mail já está em uso por outro usuário
      const emailEmUsoPorOutro = await this.usuarioRepository.exist({
        where: {
          hashEmail: novoHashEmail,
          id: Not(data.lojistaId),
        },
      });

      if (emailEmUsoPorOutro) {
        throw new BadRequestException('E-mail já está sendo utilizado');
      }

      dadosAtualizacao.email = this.encryptionService.encrypt(
        data.dadosAlteracao.email,
      );
      dadosAtualizacao.hashEmail = novoHashEmail;
    }

    // Se uma nova senha foi informada, valida se é diferente da atual
    if (data.dadosAlteracao.senha) {
      const senhaRepetida = await bcrypt.compare(
        data.dadosAlteracao.senha,
        usuarioExistente.senha,
      );

      if (senhaRepetida) {
        throw new BadRequestException('Escolha uma senha diferente da atual');
      }

      dadosAtualizacao.senha = await bcrypt.hash(data.dadosAlteracao.senha, 10);
    }

    // Garante que ao menos um campo foi realmente alterado
    if (Object.keys(dadosAtualizacao).length === 0) {
      throw new BadRequestException('Nenhum dado fornecido para alteração');
    }

    // Aplica as alterações no banco
    await this.usuarioRepository.update(usuarioExistente.id, dadosAtualizacao);

    // Recupera o usuário com os dados atualizados
    const usuarioAtualizado = await this.usuarioRepository.findOneByOrFail({
      id: usuarioExistente.id,
    });

    // Retorna o DTO com campos descriptografados
    return await mapWithDecryptionDto<UsuarioType>(
      usuarioAtualizado,
      UsuarioSchema,
      this.encryptionService,
      ['email', 'nome'],
    );
  }

  /**
   * Gera um hash SHA-256 baseado em um e-mail e uma chave secreta.
   *
   * @param email - E-mail em texto plano.
   * @returns Hash criptográfico em hexadecimal.
   *
   * @throws BadRequestException:
   *   - Se o e-mail for inválido ou estiver ausente.
   *   - Se a variável de ambiente `HASH_SECRET` não estiver definida.
   */
  private hashEmail(email: string): string {
    const secret = process.env.HASH_SECRET;

    if (!email) {
      throw new BadRequestException('Valor inválido para gerar o hash');
    }

    if (!secret) {
      throw new BadRequestException('HASH_SECRET não configurado');
    }

    return createHmac('sha256', secret).update(email).digest('hex');
  }
}
