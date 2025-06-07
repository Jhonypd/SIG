import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { RespostaPaginada } from 'src/common/interfaces/response.interface';
import { z } from 'zod';
import {
  VeiculosFiltroReq,
  VeiculoBuscaReq,
  VeiculoSchema,
} from '../dto/veiculo.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import {
  UsuarioSchema,
  UsuarioType,
} from 'src/modules/usuarios/dto/usuario.dto';

@Injectable()
export class BuscarTodosVeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly encryptionService: EncryptionService,
  ) {}
  /**
   * Busca todos os veículos do lojista autenticado com filtros opcionais.
   *
   * @param filtros - Filtros de marca, modelo, ano, preço, etc.
   * @param lojistaId - ID do lojista autenticado.
   * @returns Lista paginada de veículos com dados do usuário descriptografados.
   */
  async execute(
    filtros: z.infer<typeof VeiculosFiltroReq>,
    lojistaId: z.infer<typeof VeiculoBuscaReq>['usuarioId'],
  ): Promise<RespostaPaginada<z.infer<typeof VeiculoSchema>>> {
    const {
      marca,
      modelo,
      minAno,
      maxAno,
      minPreco,
      maxPreco,
      palavrasChave,
      pagina,
      limite,
    } = filtros;

    const filtroVeiculosQuery = this.veiculoRepository
      .createQueryBuilder('veiculo')
      .leftJoinAndSelect('veiculo.imagens', 'imagens')
      .innerJoinAndSelect('veiculo.usuario', 'usuario')
      .where('usuario.id = :lojistaId', { lojistaId });
    console.log({ filtroVeiculosQuery });
    if (marca) {
      filtroVeiculosQuery.andWhere('LOWER(veiculo.marca) LIKE LOWER(:marca)', {
        marca: `%${marca}%`,
      });
    }

    if (modelo) {
      filtroVeiculosQuery.andWhere(
        'LOWER(veiculo.modelo) LIKE LOWER(:modelo)',
        {
          modelo: `%${modelo}%`,
        },
      );
    }

    if (minAno && maxAno) {
      filtroVeiculosQuery.andWhere('veiculo.ano BETWEEN :minAno AND :maxAno', {
        minAno,
        maxAno,
      });
    } else if (minAno) {
      filtroVeiculosQuery.andWhere('veiculo.ano >= :minAno', { minAno });
    } else if (maxAno) {
      filtroVeiculosQuery.andWhere('veiculo.ano <= :maxAno', { maxAno });
    }

    if (minPreco && maxPreco) {
      filtroVeiculosQuery.andWhere(
        'veiculo.preco BETWEEN :minPreco AND :maxPreco',
        {
          minPreco,
          maxPreco,
        },
      );
    } else if (minPreco) {
      filtroVeiculosQuery.andWhere('veiculo.preco >= :minPreco', { minPreco });
    } else if (maxPreco) {
      filtroVeiculosQuery.andWhere('veiculo.preco <= :maxPreco', { maxPreco });
    }

    if (palavrasChave?.trim()) {
      const palavras = `%${palavrasChave.toLowerCase()}%`;
      filtroVeiculosQuery.andWhere(
        `(LOWER(veiculo.descricao) LIKE :palavras
      OR LOWER(veiculo.modelo) LIKE :palavras
      OR LOWER(veiculo.marca) LIKE :palavras)`,
        { palavras },
      );
    }

    filtroVeiculosQuery
      .orderBy('veiculo.preco', 'DESC')
      .skip(pagina * limite)
      .take(limite);

    const [lista, total] = await filtroVeiculosQuery.getManyAndCount();

    const listaTratada = await Promise.all(
      lista.map(async (veiculo) => {
        return {
          ...veiculo,
          usuario: await mapWithDecryptionDto<UsuarioType>(
            veiculo.usuario,
            UsuarioSchema,
            this.encryptionService,
            ['nome', 'email'],
          ),
        };
      }),
    );
    console.log({ listaTratada });
    return {
      ListaGrid: listaTratada,
      ItensPorPagina: limite,
      TotalPaginas: Math.ceil(total / limite),
      TotalRegistros: total,
      TotalRegistrosFiltrados: total,
      PaginaAtual: pagina,
    };
  }
}
