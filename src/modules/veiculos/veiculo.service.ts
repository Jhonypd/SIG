import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from './veiculos.entity';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { z } from 'zod';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly buscarVeiculoService: BuscarVeiculoService,
  ) {}

  async update(
    veiculoId: string,
    usuarioId: string,
    updateData: Partial<Veiculo>,
  ) {
    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId,
      usuarioId,
    });

    Object.assign(veiculo, updateData);

    if (!veiculo.Resultado) {
      throw new Error('Veiculo não encontrado');
    }

    return this.veiculoRepository.save(veiculo.Resultado);
  }

  async remove(veiculoId: string, usuarioId: string) {
    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId,
      usuarioId,
    });

    if (!veiculo.Resultado) {
      throw new Error('Veiculo não encontrado');
    }

    // Busca o registro real do banco para garantir que é uma instância de Veiculo
    const entity = await this.veiculoRepository.findOne({
      where: { id: veiculo.Resultado.id },
      relations: ['usuario', 'imagens'],
    });

    if (!entity) {
      throw new Error('Veiculo não encontrado no banco de dados');
    }

    return this.veiculoRepository.remove(entity);
  }
}
