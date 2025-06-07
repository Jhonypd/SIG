import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { z } from 'zod';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Intercepta a requisição antes de passar para o handler.
   * Verifica se o token está presente e válido.
   */
  canActivate(contexto: ExecutionContext) {
    const req = contexto.switchToHttp().getRequest<Request>();
    const token = this.extrairToken(req);

    if (!token) {
      throw new UnauthorizedException({
        error: 'Token não fornecido',
        message: 'Usuário não autenticado',
      });
    }

    return super.canActivate(contexto);
  }

  /**
   * Trata o resultado da autenticação. Se válido, anexa o usuário à requisição.
   */
  handleRequest<T = z.infer<typeof JwtPayload>>(
    erro: any,
    usuario: T,
    info: any,
    contexto: ExecutionContext,
  ) {
    if (erro || !usuario) {
      throw this.criarExcecao(info || erro);
    }

    // Anexa o usuário decodificado à requisição
    const req = contexto.switchToHttp().getRequest<Request>();
    req['usuario'] = usuario;

    return usuario;
  }

  /**
   * Extrai o token JWT do header da requisição.
   */
  private extrairToken(req: Request): string | null {
    const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : null;
  }

  /**
   * Mapeia os erros comuns de autenticação JWT para mensagens mais amigáveis.
   */
  private criarExcecao(erro: any): UnauthorizedException {
    if (erro?.name === 'TokenExpiredError') {
      return new UnauthorizedException({
        error: 'Sessão expirada',
        message: 'Faça login novamente para continuar',
      });
    }

    if (erro?.name === 'JsonWebTokenError') {
      return new UnauthorizedException({
        error: 'Token inválido',
        message: 'Erro de autenticação, tente novamente',
      });
    }

    return new UnauthorizedException('Não autorizado');
  }
}
