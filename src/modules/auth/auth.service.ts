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
