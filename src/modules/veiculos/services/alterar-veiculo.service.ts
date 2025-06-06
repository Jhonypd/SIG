import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { BuscarVeiculoService } from './buscar-veiculo.service';
import { z } from 'zod';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import { AtualizaVeiculoDto, VeiculoBuscaReq, VeiculoSchema } from '../dto/veiculo.dto';

@Injectable()
export class AlterarVeiculoService {
  constructor(
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly dataSource: DataSource,
    private readonly imagemService: ImagemService,
  ) {}

  async execute(
    data: z.infer<typeof AtualizaVeiculoDto>,
    lojistaId: z.infer<typeof VeiculoBuscaReq>['usuarioId'],
  ): Promise<z.infer<typeof VeiculoSchema>> {
    let novaImagem: z.infer<typeof VeiculoSchema.shape.imagens> | [] = [];

    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId: data.veiculoId,
      usuarioId: lojistaId,
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Atualização dos dados principais
      const { marca, modelo, ano, preco, descricao } = data.veiculo;
      Object.assign(veiculo, { marca, modelo, ano, preco, descricao });
      await queryRunner.manager.save(Veiculo, veiculo);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    /** atualização das imagens de forma mais isolada, para que possíveis
     * erros nas imagens não atrapalhem em atualizar as informações do veiculo
     */

    try {
      if (data.veiculo.imagensExcluir?.length) {
        await this.imagemService.deleteImagens(
          {
            veiculoId: veiculo.id,
            ids: data.veiculo.imagensExcluir.map((id) => id),
          },
          this.dataSource.manager,
        );
      }

      const imagensIncluir = data.veiculo.imagensIncluir?.filter(Boolean) ?? [];

      if (imagensIncluir.length > 0) {
        const novasImagens = await Promise.all(
          imagensIncluir.map((imagemUrl) =>
            this.imagemService.criar(
              {
                nome: `${veiculo.marca.replace(' ', '_')}-${veiculo.modelo.replace(' ', '_')}-${veiculo.id.split('-')[4]}`,
                url: imagemUrl.url,
                veiculoId: veiculo.id,
              },
              this.dataSource.manager,
            ),
          ),
        );
        novaImagem = await this.dataSource.manager.save(novasImagens);
      }
    } catch (imagemError) {
      console.error(
        'Houve um ou mais erros durante o processamento das imagens:',
        imagemError,
      );
    }

    return { ...veiculo, imagens: novaImagem };
  }
}
