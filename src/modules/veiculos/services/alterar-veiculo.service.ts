import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { BuscarVeiculoService } from './buscar-veiculo.service';
import { z } from 'zod';
import { AtualizaVeiculoDto } from '../dto/atualiza-veiculo.dto';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import { VeiculoSchemaDto } from '../dto/veiculo.dto';

@Injectable()
export class AlterarVeiculoService {
  constructor(
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly dataSource: DataSource,
    private readonly imagemService: ImagemService,
  ) {}

  async execute(
    data: z.infer<typeof AtualizaVeiculoDto>,
  ): Promise<z.infer<typeof VeiculoSchemaDto>> {
    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId: data.veiculoId,
      usuarioId: data.lojistaId,
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { marca, modelo, ano, preco, descricao } = data.veiculo;
      Object.assign(veiculo, { marca, modelo, ano, preco, descricao });
      await queryRunner.manager.save(Veiculo, veiculo);

      await this.imagemService.deleteImagens(
        {
          veiculoId: veiculo.id,
          ids: data.veiculo.imagensExcluir.map((img) => img.id),
        },
        queryRunner.manager,
      );

      const imagensIncluir = data.veiculo.imagensIncluir?.filter(Boolean) ?? [];
      if (imagensIncluir.length > 0) {
        const novasImagens = await Promise.all(
          imagensIncluir.map((img) =>
            this.imagemService.criar(
              {
                nome:
                  veiculo.marca +
                  '-' +
                  veiculo.modelo +
                  '-' +
                  veiculo.id.split('-')[0],
                url: img,
                veiculoId: veiculo.id,
              },
              queryRunner.manager,
            ),
          ),
        );
        await queryRunner.manager.save(novasImagens);
      }

      await queryRunner.commitTransaction();
      return veiculo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
