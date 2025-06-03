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
import { VeiculoService } from './veiculo.service';
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

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('veiculos')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VeiculoService,
    private readonly criarVeiculoService: CriarVeiculoService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly buscarTodosVeiculoService: BuscarTodosVeiculosService,
  ) {}

  @Get('todos')
  @ApiCreatedResponse({
    description: 'Operação realizada com sucesso.',
    type: RespostaPadraoDto,
  })
  @ApiQuery({ type: FiltroVeiculoRequestDto, required: false })
  buscarTodos(
    @Query(new ZodValidationPipe(FiltroVeiculoSchemaDto))
    filtros: Omit<z.infer<typeof FiltroVeiculoSchemaDto>, 'lojistaId'>,
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
  create(@Body() createVehicleDto, @getUserToken() userToken: UsuarioData) {
    return this.criarVeiculoService.create({
      ...createVehicleDto,
      lojistaId: userToken.id,
    });
  }

  @Put('alterar/:id')
  @ApiCreatedResponse({
    description: 'Veículo atualizado com sucesso.',
    type: RespostaPadraoDto,
  })
  alterar(@Param('id') id: string, @Body() updateVehicleDto, @Request() req) {
    const userId = req.userToken.id;
    return this.vehiclesService.update(id, userId, updateVehicleDto);
  }

  @Delete('deletar/:id')
  @ApiCreatedResponse({
    description: 'Veículo removido com sucesso.',
    type: RespostaPadraoDto,
  })
  deletar(@Param('id') id: string, @Request() req) {
    const userId = req.userToken.id;
    return this.vehiclesService.remove(id, userId);
  }
}
