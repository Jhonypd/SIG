import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veiculo } from './veiculos.entity';
import { VeiculosController } from './veiculo.controller';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { ImagemModule } from '../imagens/imagens.module';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { CriptografiaService } from 'src/common/encryption/criptografia.service';
import { BuscarTodosVeiculosService } from './services/buscar-todos-veiculos.service';
import { DeletarVeiculoService } from './services/deletar-veiculo.service';
import { AlterarVeiculoService } from './services/alterar-veiculo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo]), ImagemModule],
  providers: [
    AlterarVeiculoService,
    CriarVeiculoService,
    BuscarVeiculoService,
    CriptografiaService,
    BuscarTodosVeiculosService,
    DeletarVeiculoService,
  ],
  controllers: [VeiculosController],
})
export class VeiculosModule {}
