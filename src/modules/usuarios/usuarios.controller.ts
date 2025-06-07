import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { RespostaPadraoSwaggerDto } from 'src/common/dto/response.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';
import { AlterarUsuarioService } from './services/alterar-usuario.service';
import { getUserToken } from 'src/common/decorators/get-user-token.decorator';
import { UsuarioData } from 'src/common/interfaces/usuario-data';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AlterarUsuarioRequestDto } from './dto/swagger/usuario-alterar-request.dto';
import {
  RespostaPadrao,
  TipoRetorno,
} from 'src/common/interfaces/response.interface';
import { UsuarioSchema, UsuarioControllerCriar } from './dto/usuario.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly alterarUsuarioService: AlterarUsuarioService) {}

  @Put('alterar')
  @ApiOperation({
    summary: 'Atualiza os dados do usuário logado',
    description:
      'Permite atualizar o e-mail, a senha ou ambos para o usuário autenticado.',
  })
  @ApiBody({
    type: AlterarUsuarioRequestDto,
    examples: {
      atualizarEmail: {
        value: { dadosAlteracao: { email: 'novo@email.com' } },
      },
      atualizarSenha: { value: { dadosAlteracao: { senha: 'Senha123' } } },
      atualizaEmailEsenha: {
        value: {
          dadosAlteracao: { senha: 'Senha123', email: 'novo@email.com' },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário atualizado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  async alterarUsuario(
    @Body(new ZodValidationPipe(UsuarioControllerCriar))
    body: z.infer<typeof UsuarioControllerCriar>,
    @getUserToken() userToken: UsuarioData,
  ): Promise<RespostaPadrao<{ usuario: z.infer<typeof UsuarioSchema> }>> {
    const usuario = await this.alterarUsuarioService.execute({
      lojistaId: userToken.id,
      lojistaEmail: userToken.email,
      dadosAlteracao: body.dadosAlteracao,
    });

    return {
      Resultado: { usuario: usuario },
      Mensagem: 'Usuário atualizado com sucesso',
      Sucesso: true,
      Detalhe: null,
      CodigoRetorno: 201,
      TipoRetorno: TipoRetorno.RESPOSTA_SUCESSO,
      TempoResposta: 0,
    };
  }
}
