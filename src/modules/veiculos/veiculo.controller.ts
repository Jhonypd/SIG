import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RespostaPadraoSwaggerDto } from 'src/common/dto/response.dto';
import { UsuarioData } from 'src/common/interfaces/usuario-data';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { VeiculoReqSwagger } from './dto/swagger/criar-veiculo-request.dto';
import { BuscarTodosVeiculosService } from './services/buscar-todos-veiculos.service';
import { z } from 'zod';
import { FiltroVeiculoRequestDto } from './dto/swagger/filtro-veiculo-request.dto';
import { getUserToken } from 'src/common/decorators/get-user-token.decorator';
import { ZodValidacaoPipe } from 'src/common/pipes/zod-validacoes.pipe';
import { DeletarVeiculoService } from './services/deletar-veiculo.service';

import { AtualizaVeiculoRequestDto } from './dto/swagger/alterar-veiculo-request.dto';
import {
  AtualizaVeiculoDto,
  VeiculoCriarReq,
  VeiculosFiltroReq,
} from './dto/veiculo.dto';
import { AlterarVeiculoService } from './services/alterar-veiculo.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Veiculos')
@Controller('veiculos')
export class VeiculosController {
  constructor(
    private readonly criarVeiculoService: CriarVeiculoService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly buscarTodosVeiculoService: BuscarTodosVeiculosService,
    private readonly deleteVeiculoService: DeletarVeiculoService,
    private readonly alterarVeiculoService: AlterarVeiculoService,
  ) {}

  @Post('inserir')
  @ApiBody({ type: VeiculoReqSwagger, required: false })
  @ApiOperation({
    summary: 'Cadastrar novo veículo',
    description: 'Cadastra um novo veículo para o lojista autenticado.',
  })
  @ApiCreatedResponse({
    description: 'Veículo cadastrado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  criarVeiculo(
    @Body(new ZodValidacaoPipe(VeiculoCriarReq))
    veiculo: z.infer<typeof VeiculoCriarReq>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.criarVeiculoService.execute(veiculo, userToken.id);
  }

  @Put('alterar')
  @ApiBody({ type: AtualizaVeiculoRequestDto, required: false })
  @ApiOperation({
    summary: 'Atualizar veículo',
    description: 'Altera as informações e imagens de um veículo já existente.',
  })
  @ApiCreatedResponse({
    description: 'Veículo atualizado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  alterarVeiculo(
    @Body(new ZodValidacaoPipe(AtualizaVeiculoDto))
    body: z.infer<typeof AtualizaVeiculoDto>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.alterarVeiculoService.execute(
      {
        veiculo: body.veiculo,
        imagensIncluir: body.imagensIncluir,
        imagensExcluir: body.imagensExcluir,
        veiculoId: body.veiculoId,
      },
      userToken.id,
    );
  }

  @Delete('deletar/:id')
  @ApiOperation({
    summary: 'Deletar veículo',
    description: 'Remove um veículo do lojista pelo ID.',
  })
  @ApiCreatedResponse({
    description: 'Veículo removido com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  deletar(@Param('id') id: string, @getUserToken() userToken: UsuarioData) {
    return this.deleteVeiculoService.execute({
      veiculoId: id,
      usuarioId: userToken.id,
    });
  }

  @Get('todos')
  @ApiCreatedResponse({
    description: 'Operação realizada com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  @ApiOperation({
    summary: 'Listar veículos',
    description:
      'Busca todos os veículos cadastrados do lojista autenticado, com filtros opcionais.',
  })
  @ApiQuery({ type: FiltroVeiculoRequestDto, required: false })
  buscarTodosVeiculos(
    @Query(new ZodValidacaoPipe(VeiculosFiltroReq))
    filtros: z.infer<typeof VeiculosFiltroReq>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.buscarTodosVeiculoService.execute(filtros, userToken.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar veículo por ID',
    description: 'Retorna os detalhes de um veículo específico do lojista.',
  })
  @ApiCreatedResponse({
    description: 'Veículo encontrado com sucesso.',
    type: RespostaPadraoSwaggerDto,
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
}
