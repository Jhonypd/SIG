import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Veiculo } from './veiculos.entity';
import { BuscarVeiculoService } from './services/buscar-veiculo.service';
import { z } from 'zod';
import { VeiculoSchemaDto } from './dto/veiculo.dto';
import { RespostaPadrao, RespostaPaginada } from 'src/common/interfaces/response.interface';
import { FilterVehicleDtoSchema } from './dto/filtros-veiculo.dto';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly vehicleRepository: Repository<Veiculo>,
    private readonly buscarVeiculoService: BuscarVeiculoService,
  ) {}

  async buscarTodos(filtros: z.infer<typeof FilterVehicleDtoSchema>): Promise<RespostaPaginada<Veiculo>> {
    const {
      marca,
      modelo,
      minAno,
      maxAno,
      minPreco,
      maxPreco,
      palavrasChave,
      lojistaId,
    } = filtros;

    // WHERE dinâmico
    const where: FindOptionsWhere<Veiculo> = {
      usuario: { id: lojistaId },
    };

    if (marca) {
      where.marca = ILike(`%${marca}%`);
    }

    if (modelo) {
      where.modelo = ILike(`%${modelo}%`);
    }

    if (minAno && maxAno) {
      where.ano = Between(minAno, maxAno);
    } else if (minAno) {
      where.ano = Between(minAno, new Date().getFullYear() + 1);
    } else if (maxAno) {
      where.ano = Between(1900, maxAno);
    }

    if (minPreco && maxPreco) {
      where.preco = Between(minPreco, maxPreco);
    } else if (minPreco) {
      where.preco = Between(minPreco, Number.MAX_SAFE_INTEGER);
    } else if (maxPreco) {
      where.preco = Between(0, maxPreco);
    }

    // Consulta
    const [lista, total] = await this.vehicleRepository.findAndCount({
      where,
      relations: ['images'],
      order: { preco: 'DESC' },
    });

    // Filtro por palavras-chave na descrição (feito em memória se quiser)
    const listaFiltrada = palavrasChave
      ? lista.filter((v) =>
          v.descricao?.toLowerCase().includes(palavrasChave.toLowerCase()),
        )
      : lista;

    const totalFiltrados = listaFiltrada.length;

    return {
      Resultado: {
        GridList: listaFiltrada,
        ItensPorPagina: totalFiltrados, // ou implementar paginação real se quiser
        TotalPaginas: 1, // idem
        TotalRegistros: total,
        TotalRegistrosFiltrados: totalFiltrados,
      },
      Sucesso: true,
      CodigoRetorno: 200,
      TipoRetorno: 1,
      TempoResposta: 0,
      Mensagem: null,
      Detalhe: null,
    };
  }
}

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

    return this.vehicleRepository.save(veiculo.Resultado);
  }

  async remove(veiculoId: string, usuarioId: string) {
    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId,
      usuarioId,
    });

    if (!veiculo.Resultado) {
      throw new Error('Veiculo não encontrado');
    }

    return this.vehicleRepository.remove(veiculo.Resultado);
  }
}
