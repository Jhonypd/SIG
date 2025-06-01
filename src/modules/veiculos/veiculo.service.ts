import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from './veiculos.entity';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly vehicleRepository: Repository<Veiculo>,
    private readonly buscarVeiculoService: BuscarVeiculoService,
  ) {}

  async buscarTodos(userId: string) {
    return this.vehicleRepository.find({
      where: { usuario: { id: userId } },
      relations: ['images'],
    });
  }

  async update(
    veiculoId: string,
    usuarioId: string,
    updateData: Partial<Veiculo>,
  ) {
    const Veiculo = await this.buscarVeiculoService.execute({
      veiculoId,
      usuarioId,
    });

    Object.assign(Veiculo, updateData);

    return this.vehicleRepository.save(Veiculo);
  }

  async remove(veiculoId: string, usuarioId: string) {
    const Veiculo = await this.buscarVeiculoService.execute({
      veiculoId,
      usuarioId,
    });
    return this.vehicleRepository.remove(Veiculo);
  }
}
