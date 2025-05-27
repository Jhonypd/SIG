import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
