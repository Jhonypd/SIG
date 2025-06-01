import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veiculo } from './veiculos.entity';
import { VeiculoService } from './veiculo.service';
import { VehiclesController } from './veiculo.controller';
import { CriarVeiculoService } from './services/criar-veiculo.service';
import { ImagemModule } from '../imagens/imagens.module';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo]), ImagemModule],
  providers: [
    VeiculoService,
    CriarVeiculoService,
    BuscarVeiculoService,
    EncryptionService,
  ],
  controllers: [VehiclesController],
})
export class VeiculosModule {}
