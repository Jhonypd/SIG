import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterRequestDto } from './dto/swagger/register-request.dto';
import { RespostaPadraoDto } from 'src/common/dto/response.dto';
import { LoginRequestDto } from './dto/swagger/login-request.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';

@ApiTags('Autorizacao')
@Controller('autorizacao')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiBody({ type: RegisterRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Cadastro realizado com sucesso.',
    type: RespostaPadraoDto,
  })
  async registro(
    @Body(new ZodValidationPipe(RegisterDto)) body: z.infer<typeof RegisterDto>,
  ) {
    return this.authService.registrar(body);
  }

  @Post('gerarToken')
  @ApiBody({ type: LoginRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Login realizado com sucesso.',
    type: RespostaPadraoDto,
  })
  async gerarToken(
    @Body(new ZodValidationPipe(LoginDto)) body: z.infer<typeof LoginDto>,
  ) {
    return this.authService.gerarTokenLogin(body);
  }
}
