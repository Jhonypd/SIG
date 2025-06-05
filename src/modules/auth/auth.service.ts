import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { z } from 'zod';
import { LoginDto } from './dto/login.dto';
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

  async registrar(data: z.infer<typeof RegisterDto>): Promise<{ Id: string }> {
    const validation = RegisterDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors.map((e) => e.message).join(', '),
      );
    }

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
    data: z.infer<typeof LoginDto>,
  ): Promise<{ Token: string; Validade: Date | null }> {
    const validation = LoginDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors.map((e) => e.message).join(', '),
      );
    }

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
