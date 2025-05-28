import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { StandardResponseDto } from 'src/common/dto/response.dto';
import { LoginRequestDto } from './dto/login-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterRequestDto })
  @ApiCreatedResponse({
    description: 'Cadastro realizado com sucesso.',
    type: StandardResponseDto,
  })
  async register(@Body() body: z.infer<typeof RegisterDto>) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiBody({ type: LoginRequestDto })
  @ApiCreatedResponse({
    description: 'Login realizado com sucesso.',
    type: StandardResponseDto,
  })
  async login(@Body() body: z.infer<typeof LoginDto>) {
    return this.authService.login(body);
  }
}
