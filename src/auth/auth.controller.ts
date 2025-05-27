import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: z.infer<typeof RegisterDto>) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: z.infer<typeof LoginDto>) {
    return this.authService.login(body);
  }
}
