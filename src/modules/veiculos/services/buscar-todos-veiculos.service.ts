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
import { mapearComDescriptografia } from 'src/common/mapper/mapear-descriptografia.mapper.ts';
import { CriptografiaService } from 'src/common/encryption/criptografia.service';
import {
  UsuarioSchema,
  UsuarioType,
} from 'src/modules/usuarios/dto/usuario.dto';

@Injectable()
export class BuscarTodosVeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepositorio: Repository<Veiculo>,
    private readonly criptografiaService: CriptografiaService,
  ) {}

  /**
   * Busca paginada de todos os veículos do lojista autenticado, com filtros opcionais.
   *
   * @param filtros - Parâmetros de filtro como marca, modelo, ano, preço, etc.
   * @param lojistaId - ID do lojista autenticado.
   * @returns Objeto de resposta paginada contendo veículos e dados do usuário descriptografados.
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

    // Criação da query base com joins e filtro por lojista
    const consultaVeiculos = this.veiculoRepositorio
      .createQueryBuilder('veiculo')
      .leftJoinAndSelect('veiculo.imagens', 'imagens')
      .innerJoinAndSelect('veiculo.usuario', 'usuario')
      .where('usuario.id = :lojistaId', { lojistaId });

    // Filtros por marca e modelo com case-insensitive
    if (marca) {
      consultaVeiculos.andWhere('LOWER(veiculo.marca) LIKE LOWER(:marca)', {
        marca: `%${marca}%`,
      });
    }

    if (modelo) {
      consultaVeiculos.andWhere('LOWER(veiculo.modelo) LIKE LOWER(:modelo)', {
        modelo: `%${modelo}%`,
      });
    }

    // Filtro por intervalo de ano
    if (minAno && maxAno) {
      consultaVeiculos.andWhere('veiculo.ano BETWEEN :minAno AND :maxAno', {
        minAno,
        maxAno,
      });
    } else if (minAno) {
      consultaVeiculos.andWhere('veiculo.ano >= :minAno', { minAno });
    } else if (maxAno) {
      consultaVeiculos.andWhere('veiculo.ano <= :maxAno', { maxAno });
    }

    // Filtro por intervalo de preço
    if (minPreco && maxPreco) {
      consultaVeiculos.andWhere(
        'veiculo.preco BETWEEN :minPreco AND :maxPreco',
        {
          minPreco,
          maxPreco,
        },
      );
    } else if (minPreco) {
      consultaVeiculos.andWhere('veiculo.preco >= :minPreco', { minPreco });
    } else if (maxPreco) {
      consultaVeiculos.andWhere('veiculo.preco <= :maxPreco', { maxPreco });
    }

    // Filtro por palavras-chave no modelo, marca ou descrição
    if (palavrasChave?.trim()) {
      const palavra = `%${palavrasChave.toLowerCase()}%`;
      consultaVeiculos.andWhere(
        `(LOWER(veiculo.descricao) LIKE :palavra
          OR LOWER(veiculo.modelo) LIKE :palavra
          OR LOWER(veiculo.marca) LIKE :palavra)`,
        { palavra },
      );
    }

    // Ordenação e paginação
    consultaVeiculos
      .orderBy('veiculo.preco', 'DESC')
      .skip(pagina * limite)
      .take(limite);

    const [listaVeiculos, total] = await consultaVeiculos.getManyAndCount();

    // Descriptografando dados sensíveis do usuário
    const listaFinal = await Promise.all(
      listaVeiculos.map(async (veiculo) => ({
        ...veiculo,
        usuario: await mapearComDescriptografia<UsuarioType>(
          veiculo.usuario,
          UsuarioSchema,
          this.criptografiaService,
          ['nome', 'email'],
        ),
      })),
    );

    return {
      ListaGrid: listaFinal,
      ItensPorPagina: limite,
      TotalPaginas: Math.ceil(total / limite),
      TotalRegistros: total,
      TotalRegistrosFiltrados: total,
      PaginaAtual: pagina,
    };
  }
}
