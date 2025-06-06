import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { RegistroSchemaDto } from './dto/register.dto';
import { LoginSchemaDto } from './dto/login.dto';
import { RegistroRequestSwaggerDto } from './dto/swagger/register-request.dto';
import {
  RespostaPadraoSwaggerDto,
  TipoRetorno,
} from 'src/common/dto/response.dto';
import { LoginRequestDto } from './dto/swagger/login-request.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';

@ApiTags('Autorizacao')
@Controller('autorizacao')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({
    summary: 'Cadastra um novo usuário lojista',
    description: 'Registra um novo lojista com nome, e-mail e senha.',
  })
  @ApiBody({
    type: RegistroRequestSwaggerDto,
    examples: {
      default: {
        summary: 'Exemplo de cadastro',
        value: {
          nome: 'Jhony Da Silva',
          email: 'jhony@email.com',
          senha: 'Senha2025',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário cadastrado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  async registrarLojista(
    @Body(new ZodValidationPipe(RegistroSchemaDto))
    body: z.infer<typeof RegistroSchemaDto>,
  ): Promise<RespostaPadrao<{ Id: string }>> {
    const usuario = await this.authService.registrarLojista(body);
    return {
      Resultado: usuario,
      Sucesso: true,
      Detalhe: null,
      Mensagem: 'Usuário cadastrado com sucesso.',
      CodigoRetorno: 201,
      TipoRetorno: TipoRetorno.RESPOSTA_SUCESSO,
      TempoResposta: 0,
    };
  }

  @Post('gerarToken')
  @ApiOperation({
    summary: 'Realiza login e gera token JWT',
    description: 'Autentica o usuário lojista e retorna o token de acesso.',
  })
  @ApiBody({
    type: LoginRequestDto,
    examples: {
      default: {
        summary: 'Exemplo de login',
        value: {
          email: 'jhony@email.com',
          senha: 'Senha2025',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Login realizado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  async gerarTokenLogin(
    @Body(new ZodValidationPipe(LoginSchemaDto))
    body: z.infer<typeof LoginSchemaDto>,
  ): Promise<RespostaPadrao<{ Token: string; Validade: Date | null }>> {
    const token = await this.authService.gerarTokenLogin(body);

    return {
      Resultado: token,
      Sucesso: true,
      Detalhe: null,
      Mensagem: 'Login realizado com sucesso.',
      CodigoRetorno: 201,
      TipoRetorno: TipoRetorno.RESPOSTA_SUCESSO,
      TempoResposta: 0,
    };
  }
}
