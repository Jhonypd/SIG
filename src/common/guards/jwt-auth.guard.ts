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
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        error: 'Token não fornecido',
        message: 'Usuário não autenticado',
      });
    }

    return super.canActivate(context);
  }

  handleRequest<T = z.infer<typeof JwtPayload>>(
    err: any,
    user: T,
    info: any,
    context: ExecutionContext,
  ) {
    if (err || !user) {
      throw this.createException(info || err);
    }

    // Adiciona o userToken à requisição
    const request = context.switchToHttp().getRequest<Request>();
    request['userToken'] = user;

    return user;
  }

  private extractToken(req: Request): string | null {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  private createException(error: any): UnauthorizedException {
    if (error.name === 'TokenExpiredError') {
      return new UnauthorizedException({
        error: 'Sessão expirada',
        message: 'Faça login novamente para continuar',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return new UnauthorizedException({
        error: 'Token inválido',
        message: 'Erro de autenticação, tente novamente',
      });
    }
    return new UnauthorizedException('Não autorizado');
  }
}
