import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { RespostaPadraoDto } from 'src/common/dto/response.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';
import { AlterarUsuarioService } from './services/alterar-usuario.service';
import { AlterarUsuarioControllerSchemaDto } from './dto/alterar-usuario.dto';
import { getUserToken } from 'src/common/decorators/get-user-token.decorator';
import { UsuarioData } from 'src/common/interfaces/usuario-data';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AlterarUsuarioRequestDto } from './dto/swagger/usuario-alterar-request.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly alterarUsuarioService: AlterarUsuarioService) {}

  @Put('alterar')
  @ApiBody({ type: AlterarUsuarioRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Usuário atualizado com sucesso.',
    type: RespostaPadraoDto,
  })
  async alterarUsuario(
    @Body(new ZodValidationPipe(AlterarUsuarioControllerSchemaDto))
    body: z.infer<typeof AlterarUsuarioControllerSchemaDto>,
    @getUserToken() userToken: UsuarioData,
  ) {
    console.log({ userToken });

    return this.alterarUsuarioService.execute({
      ...body,
      lojistaId: userToken.id,
      lojistaEmail: userToken.email,
    });
  }
}
