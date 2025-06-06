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
import { RespostaPadraoSwaggerDto } from 'src/common/dto/response.dto';
import { UsuarioData } from 'src/common/interfaces/usuario-data';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { VeiculoReqSwagger } from './dto/swagger/criar-veiculo-request.dto';
import { BuscarTodosVeiculosService } from './services/buscar-todos-veiculos.service';
import { z } from 'zod';
import { FiltroVeiculoRequestDto } from './dto/swagger/filtro-veiculo-request.dto';
import { getUserToken } from 'src/common/decorators/get-user-token.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';
import { DeleteVeiculoService } from './services/delete-veiculo.service';
import { AlterarVeiculoService } from './services/alterar-veiculo.service';

import { AtualizaVeiculoRequestDto } from './dto/swagger/alterar-veiculo-request.dto';
import {
  AtualizaVeiculoDto,
  VeiculoCriarReq,
  VeiculosFiltroReq,
} from './dto/veiculo.dto';

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
    type: RespostaPadraoSwaggerDto,
  })
  @ApiQuery({ type: FiltroVeiculoRequestDto, required: false })
  buscarTodosVeiculos(
    @Query(new ZodValidationPipe(VeiculosFiltroReq))
    filtros: z.infer<typeof VeiculosFiltroReq>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.buscarTodosVeiculoService.execute(filtros, userToken.id);
  }

  @Get(':id')
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

  @Post('inserir')
  @ApiBody({ type: VeiculoReqSwagger, required: false })
  @ApiCreatedResponse({
    description: 'Veículo cadastrado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  criarVeiculo(
    @Body(new ZodValidationPipe(VeiculoCriarReq))
    veiculo: z.infer<typeof VeiculoCriarReq>,
    @getUserToken() userToken: UsuarioData,
  ) {
    return this.criarVeiculoService.execute(veiculo, userToken.id);
  }

  @Put('alterar')
  @ApiBody({ type: AtualizaVeiculoRequestDto, required: false })
  @ApiCreatedResponse({
    description: 'Veículo atualizado com sucesso.',
    type: RespostaPadraoSwaggerDto,
  })
  alterarVeiculo(
    @Body(new ZodValidationPipe(AtualizaVeiculoDto))
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
}
