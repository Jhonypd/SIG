import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException(this.getErrorMessage(info));
    }
    return user;
  }

  private extractToken(request: RequestWithUser): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  private getErrorMessage(info: any): string {
    if (info instanceof Error) {
      return info.message;
    }
    switch (info?.name) {
      case 'TokenExpiredError':
        return 'Token expirado. Faça login novamente para continuar.';
      case 'JsonWebTokenError':
        return 'Token inválido ou corrompido';
      default:
        return 'Não autorizado';
    }
  }
}
