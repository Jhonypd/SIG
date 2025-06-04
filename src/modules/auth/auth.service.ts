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
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { UsuarioService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async registrar(
    data: z.infer<typeof RegisterDto>,
  ): Promise<RespostaPadrao<{ Id: string }>> {
    const validation = RegisterDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors.map((e) => e.message).join(', '),
      );
    }

    const existingUser = await this.usuarioService.buscarUsuario(data.email);

    if (existingUser.Resultado) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const user = await this.usuarioService.criar(data);

    if (!user.Resultado) {
      throw new BadRequestException('Erro ao cadastrar usuário');
    }

    return {
      Resultado: { Id: user.Resultado?.id },
      Sucesso: true,
      Mensagem: 'Usuário cadastrado com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }

  async gerarTokenLogin(
    data: z.infer<typeof LoginDto>,
  ): Promise<RespostaPadrao<{ Token: string; Validade: Date | null }>> {
    const validation = LoginDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(
        validation.error.errors.map((e) => e.message).join(', '),
      );
    }

    let validade: Date | null = null;

    const usuario = await this.usuarioService.buscarUsuario(data.email);

    if (!usuario.Resultado) {
      throw new UnauthorizedException('Usuário e/ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(
      data.senha,
      usuario.Resultado.senha,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário e/ou senha inválidos');
    }

    const payload = {
      id: usuario.Resultado.id,
      email: this.encryptionService.decrypt(usuario.Resultado.email),
      name: this.encryptionService.decrypt(usuario.Resultado.nome),
    };
    const token = await this.jwtService.signAsync(payload);

    validade = new Date(this.jwtService.decode(token)['exp'] * 1000);

    return {
      Resultado: {
        Token: token,
        Validade: validade,
      },
      Sucesso: true,
      Mensagem: 'Login realizado com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
}
