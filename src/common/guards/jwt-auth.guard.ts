import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { userDataToken } from 'src/common/interfaces/user-data';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { userToken: userDataToken }>();

    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const encryptedToken = authHeader.replace('Bearer ', '').trim();

    let tokenPayload: userDataToken;

    try {
      tokenPayload = (await this.jwtService.verify(
        encryptedToken,
      )) as userDataToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Token expirado. Faça login novamente para continuar.',
        );
      }
      throw new UnauthorizedException(
        error.message || 'Token inválido ou corrompido',
      );
    }

    const { id, email, name } = tokenPayload;

    if (!id) {
      throw new UnauthorizedException('Token sem id do usuário');
    }
    if (!email) {
      throw new UnauthorizedException('Token sem email do usuário');
    }
    if (!email) {
      throw new UnauthorizedException('Token sem email do usuário');
    }
    if (!name) {
      throw new UnauthorizedException('Token sem nome do usuário');
    }

    request['userToken'] = tokenPayload;

    return true;
  }
}
