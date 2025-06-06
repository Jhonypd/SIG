import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { z } from 'zod';

/**
 * Decorator personalizado para recuperar o payload do usuário logado a partir do JWT.
 *
 * Esse decorator depende da estratégia JWT (`JwtStrategy`) e do guard (`JwtAuthGuard`)
 * para popular o campo `request.userToken` com os dados descriptografados do usuário.
 *
 * Pode ser usado diretamente nos controllers para acessar os dados do usuário autenticado.
 *
 * Exemplo de uso:
 * ```
 * @Get()
 * minhaRota( @getUserToken() userToken: UsuarioData) {
 *   console.log(usuario.id); // acesso ao ID do usuário autenticado
 * }
 * ```
 *
 * @returns UsuarioData - objeto com `id`, `email`, `nome`, conforme a estrutura definida no schema `JwtPayload`.
 */
export const getUserToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.userToken as z.infer<typeof JwtPayload>;
  },
);
