import { Request } from 'express';
import { z } from 'zod';

export const JwtPayload = z.object({
  id: z.string().uuid(),
  email: z.string().email().nonempty(),
  nome: z.string().nonempty(),
});

export interface RequestWithUser extends Request {
  user: z.infer<typeof JwtPayload>;
}

export type JwtPayloadType = z.infer<typeof JwtPayload>;
