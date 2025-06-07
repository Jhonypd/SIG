import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { z } from 'zod';
import { VeiculoBuscaReq } from '../dto/veiculo.dto';

@Injectable()
export class DeletarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepositorio: Repository<Veiculo>,
  ) {}

  /**
   * Remove um veículo pertencente ao lojista autenticado.
   *
   * @param dados - Contém o ID do veículo e o ID do lojista.
   * @returns ID do veículo removido com sucesso.
   * @throws BadRequestException - Se o veículo não for encontrado ou não pertencer ao lojista.
   */
  async execute(dados: z.infer<typeof VeiculoBuscaReq>): Promise<string> {
    // Busca o veículo com base no ID e valida a posse pelo usuário
    const veiculo = await this.veiculoRepositorio.findOne({
      where: { id: dados.veiculoId, usuario: { id: dados.usuarioId } },
      relations: ['usuario', 'imagens'],
    });

    if (!veiculo) {
      throw new BadRequestException({
        error: `Veículo com ID ${dados.veiculoId} não encontrado`,
        message: 'Veículo não encontrado ou não pertence ao lojista.',
      });
    }

    // Remove o veículo do banco de dados
    await this.veiculoRepositorio.remove(veiculo);

    // Retorna o ID do veículo removido como confirmação
    return `${dados.veiculoId}`;
  }
}
