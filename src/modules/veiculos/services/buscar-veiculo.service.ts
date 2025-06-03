import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { VeiculoSchemaDto } from '../dto/veiculo.dto';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
  ) {}

  async execute(data: {
    veiculoId: string;
    usuarioId: string;
  }): Promise<RespostaPadrao<z.infer<typeof VeiculoSchemaDto>>> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['imagens', 'usuario'],
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return {
      Resultado: {
        ...veiculo,
      },
      Sucesso: true,
      Mensagem: 'Veículo criado com sucesso',
      Detalhe: null,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
    };
  }
}
