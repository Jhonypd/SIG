import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { z } from 'zod';
import { VeiculoBuscaReq } from '../dto/veiculo.dto';

@Injectable()
export class DeleteVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
  ) {}

  async execute(
    data: z.infer<typeof VeiculoBuscaReq>,
  ): Promise<RespostaPadrao> {
    // Buscar o veículo diretamente do repositório
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['usuario', 'imagens'],
    });

    if (!veiculo) {
      throw new BadRequestException({
        error: `Veiculo com id ${data.veiculoId} não encontrado`,
        message: 'Veículo não encontrado',
      });
    }

    await this.veiculoRepository.remove(veiculo);

    return {
      Resultado: null,
      Sucesso: true,
      Mensagem: 'Veículo excluido com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
}
