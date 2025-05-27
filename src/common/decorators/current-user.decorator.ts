import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { userDataToken } from '../interfaces/user-data-token';

export const getUserToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): userDataToken => {
    const req = ctx.switchToHttp().getRequest();
    return req.userToken as userDataToken;
  },
);
