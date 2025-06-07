import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Decorador personalizado para recuperar os dados do usuário logado a partir do JWT.
 *
 * Esse decorador depende da estratégia JWT (`JwtStrategy`) e do guard (`JwtAuthGuard`)
 * para popular o campo `request.usuario` com os dados descriptografados do token JWT.
 *
 * Pode ser utilizado diretamente nos controllers para acessar os dados do usuário autenticado.
 *
 * Exemplo de uso:
 * ```
 * @Get()
 * minhaRota(@UsuarioToken() usuario: JwtPayload) {
 *   console.log(usuario.id); // acesso ao ID do usuário autenticado
 * }
 * ```
 *
 * @returns JwtPayload - objeto com `id`, `email`, `nome`, etc.
 */
export const UsuarioToken = createParamDecorator(
  (_: unknown, contexto: ExecutionContext) => {
    const req = contexto.switchToHttp().getRequest();
    return req.usuario; 
  },
);
