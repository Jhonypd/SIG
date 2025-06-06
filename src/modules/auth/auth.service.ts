import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegistroSchemaDto } from './dto/register.dto';
import { z } from 'zod';
import { LoginSchemaDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { BuscarUsuarioService } from '../usuarios/services/buscar-usuario.service';
import { CriarUsuarioService } from '../usuarios/services/criar-usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly buscarUsuarioService: BuscarUsuarioService,
    private readonly criarUsuarioService: CriarUsuarioService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Registra um novo lojista no sistema.
   *
   * @param data - Objeto contendo `nome`, `email` (em texto plano) e `senha`.
   *              Segue o formato definido pelo schema `RegistroSchemaDto`.
   *
   * @throws BadRequestException - Se o e-mail já estiver em uso ou se ocorrer erro na criação.
   *
   * @returns { Id: string } - Retorna o ID do usuário recém-criado.
   */
  async registrarLojista(
    data: z.infer<typeof RegistroSchemaDto>,
  ): Promise<{ Id: string }> {
    const existingUser = await this.buscarUsuarioService.execute({
      email: data.email,
    });

    if (existingUser) {
      throw new BadRequestException('E-mail já está sendo utilizado');
    }

    const user = await this.criarUsuarioService.execute(data);

    if (!user) {
      throw new BadRequestException('Erro ao cadastrar usuário');
    }

    return { Id: user.id };
  }

  /**
   * Realiza login do usuário e gera o token JWT.
   *
   * @param data - Objeto contendo `email` e `senha`, conforme `LoginSchemaDto`.
   *
   * @throws UnauthorizedException - Se o usuário não for encontrado ou a senha for inválida.
   *
   * @returns {
   *    Token: string;     // JWT válido para autenticação nas próximas requisições
   *    Validade: Date;    // Data/hora de expiração do token (UTC)
   * }
   */
  async gerarTokenLogin(
    data: z.infer<typeof LoginSchemaDto>,
  ): Promise<{ Token: string; Validade: Date | null }> {
    let validade: Date | null = null;

    const usuario = await this.buscarUsuarioService.execute({
      email: data.email,
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário e/ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(data.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário e/ou senha inválidos');
    }

    const payload = {
      id: usuario.id,
      email: this.encryptionService.decrypt(usuario.email),
      name: this.encryptionService.decrypt(usuario.nome),
    };

    const token = await this.jwtService.signAsync(payload);

    validade = new Date(this.jwtService.decode(token)['exp'] * 1000);

    return {
      Token: token,
      Validade: validade,
    };
  }
}
