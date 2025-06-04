import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RespostaPadraoDto } from 'src/common/dto/response.dto';
import { UsuarioData } from 'src/common/interfaces/usuario-data';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { CriarVeiculoRequestDto } from './dto/swagger/criar-veiculo-request.dto';
import { BuscarTodosVeiculosService } from './services/buscar-todos-veiculos.service';
import { FiltroVeiculoSchemaDto } from './dto/filtros-veiculo.dto';
import { z } from 'zod';
import { FiltroVeiculoRequestDto } from './dto/swagger/filtro-veiculo-request.dto';
import { getUserToken } from 'src/common/decorators/get-user-token.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';
import { DeleteVeiculoService } from './services/delete-veiculo.service';
import { AlterarVeiculoService } from './services/alterar-veiculo.service';
import { CriarVeiculoSchemaDto } from './dto/criar-veiculo.dto';
import { VeiculoSchemaDto } from './dto/veiculo.dto';
import { AtualizaVeiculoDto } from './dto/atualiza-veiculo.dto';
import { AtualizaVeiculoRequestDto } from './dto/swagger/alterar-veiculo-request.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('veiculos')
export class VeiculosController {
  constructor(
    private readonly criarVeiculoService: CriarVeiculoService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly buscarTodosVeiculoService: BuscarTodosVeiculosService,
    private readonly deleteVeiculoService: DeleteVeiculoService,
    private readonly alterarVeiculoService: AlterarVeiculoService,
  ) {}

  @Get('todos')
  @ApiCreatedResponse({
    description: 'Operação realizada com sucesso.',
    type: RespostaPadraoDto,
  })
  @ApiQuery({ type: FiltroVeiculoRequestDto, required: false })
  buscarTodosVeiculos(
    @Query(new ZodValidationPipe(FiltroVeiculoSchemaDto))
    filtros: z.infer<typeof FiltroVeiculoSchemaDto>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.buscarTodosVeiculoService.execute(filtros, userToken.id);
  }

  @Get(':id')
  @ApiCreatedResponse({
    description: 'Veículo encontrado com sucesso.',
    type: RespostaPadraoDto,
  })
  buscarVeiculo(
    @Param('id') id: string,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.buscarVeiculoService.execute({
      usuarioId: userToken.id,
      veiculoId: id,
    });
  }

  @Post('inserir')
  @ApiBody({ type: CriarVeiculoRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Veículo cadastrado com sucesso.',
    type: RespostaPadraoDto,
  })
  criarVeiculo(
    @Body(new ZodValidationPipe(CriarVeiculoSchemaDto))
    veiculo: z.infer<typeof CriarVeiculoSchemaDto>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.criarVeiculoService.execute(veiculo, userToken.id);
  }

  @Put('alterar')
  @ApiBody({ type: AtualizaVeiculoRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Veículo atualizado com sucesso.',
    type: RespostaPadraoDto,
  })
  alterarVeiculo(
    @Param('id') id: z.infer<typeof VeiculoSchemaDto.shape.usuario.shape.id>,
    @Body(new ZodValidationPipe(AtualizaVeiculoDto))
    body: z.infer<typeof AtualizaVeiculoDto>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.alterarVeiculoService.execute({
      veiculoId: id,
      lojistaId: userToken.id,

      veiculo: {
        ...body.veiculo,
        descricao: body.veiculo.descricao ? body.veiculo.descricao : undefined,
        imagensIncluir:
          body.veiculo.imagensIncluir && body.veiculo.imagensIncluir?.length > 0
            ? body.veiculo.imagensIncluir
            : [],
        imagensExcluir:
          body.veiculo.imagensExcluir && body.veiculo.imagensExcluir?.length > 0
            ? body.veiculo.imagensExcluir
            : [],
      },
    });
  }

  @Delete('deletar/:id')
  @ApiCreatedResponse({
    description: 'Veículo removido com sucesso.',
    type: RespostaPadraoDto,
  })
  deletar(@Param('id') id: string, @getUserToken() userToken: UsuarioData) {
    return this.deleteVeiculoService.execute({
      veiculoId: id,
      usuarioId: userToken.id,
    });
  }
}
