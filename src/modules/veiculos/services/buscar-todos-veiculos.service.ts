import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { RespostaPaginada } from 'src/common/interfaces/response.interface';
import { FiltroVeiculoSchemaDto } from '../dto/filtros-veiculo.dto';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validations.pipe';

@Injectable()
export class BuscarTodosVeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
  ) {}

  async execute(
    filtros: z.infer<typeof FiltroVeiculoSchemaDto>,
  ): Promise<RespostaPaginada<Veiculo>> {
    new ZodValidationPipe(FiltroVeiculoSchemaDto);

    const {
      marca,
      modelo,
      minAno,
      maxAno,
      minPreco,
      maxPreco,
      palavrasChave,
      lojistaId,
      pagina,
      limite,
    } = filtros;

    const qb = this.veiculoRepository
      .createQueryBuilder('veiculo')
      .leftJoinAndSelect('veiculo.imagens', 'imagens')
      .leftJoinAndSelect('veiculo.usuario', 'usuario')
      .where('usuario.id = :lojistaId', { lojistaId });

    if (marca) {
      qb.andWhere('veiculo.marca ILIKE :marca', { marca: `%${marca}%` });
    }

    if (modelo) {
      qb.andWhere('veiculo.modelo ILIKE :modelo', { modelo: `%${modelo}%` });
    }

    if (minAno && maxAno) {
      qb.andWhere('veiculo.ano BETWEEN :minAno AND :maxAno', {
        minAno,
        maxAno,
      });
    } else if (minAno) {
      qb.andWhere('veiculo.ano >= :minAno', { minAno });
    } else if (maxAno) {
      qb.andWhere('veiculo.ano <= :maxAno', { maxAno });
    }

    if (minPreco && maxPreco) {
      qb.andWhere('veiculo.preco BETWEEN :minPreco AND :maxPreco', {
        minPreco,
        maxPreco,
      });
    } else if (minPreco) {
      qb.andWhere('veiculo.preco >= :minPreco', { minPreco });
    } else if (maxPreco) {
      qb.andWhere('veiculo.preco <= :maxPreco', { maxPreco });
    }

    if (palavrasChave) {
      qb.andWhere('LOWER(veiculo.descricao) LIKE :palavras', {
        palavras: `%${palavrasChave.toLowerCase()}%`,
      });
    }
    console.log(pagina * limite);
    qb.orderBy('veiculo.preco', 'DESC')
      .skip(pagina * limite)
      .take(limite);

    const [lista, total] = await qb.getManyAndCount();

    return {
      Resultado: {
        ListaGrid: lista,
        ItensPorPagina: limite,
        TotalPaginas: Math.ceil(total / limite),
        TotalRegistros: total,
        TotalRegistrosFiltrados: total,
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
