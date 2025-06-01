import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
  ) {}

  async execute(data: { veiculoId: string; usuarioId: string }) {
    const Veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['imagens', 'usuario'],
    });

    if (!Veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return Veiculo;
  }
}
