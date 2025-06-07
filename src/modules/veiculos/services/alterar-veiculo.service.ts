import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { BuscarVeiculoService } from './buscar-veiculo.service';
import { z } from 'zod';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import {
  AtualizaVeiculoDto,
  VeiculoBuscaReq,
  VeiculoSchema,
} from '../dto/veiculo.dto';

@Injectable()
export class AlterarVeiculoService {
  constructor(
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly dataSource: DataSource,
    private readonly imagemService: ImagemService,
  ) {}

  /**
   * Atualiza os dados de um veículo específico, incluindo informações principais e imagens.
   *
   * @param data - Objeto contendo os dados do veículo, imagens a incluir/excluir e ID do veículo.
   * @param lojistaId - ID do usuário lojista autenticado.
   *
   * @returns Objeto do tipo `VeiculoSchema` com os dados atualizados e lista de imagens.
   *
   * @throws NotFoundException - Caso o veículo informado não seja encontrado.
   */
  async execute(
    data: z.infer<typeof AtualizaVeiculoDto>,
    lojistaId: z.infer<typeof VeiculoBuscaReq>['usuarioId'],
  ): Promise<z.infer<typeof VeiculoSchema>> {
    let imagensAtuais: z.infer<typeof VeiculoSchema.shape.imagens> | [] = [];

    const veiculo = await this.buscarVeiculoService.execute({
      veiculoId: data.veiculoId,
      usuarioId: lojistaId,
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const transacao = this.dataSource.createQueryRunner();
    await transacao.connect();
    await transacao.startTransaction();

    try {
      // Atualização dos dados principais do veículo
      const { marca, modelo, ano, preco, descricao } = data.veiculo;
      Object.assign(veiculo, { marca, modelo, ano, preco, descricao });

      await transacao.manager.save(Veiculo, veiculo);

      await transacao.commitTransaction();
    } catch (erro) {
      await transacao.rollbackTransaction();
      throw erro;
    } finally {
      await transacao.release();
    }

    /**
     * Atualização das imagens é feita de forma isolada para evitar
     * que erros nesse processo afetem a atualização dos dados principais.
     */
    try {
      if (data.imagensExcluir?.length) {
        await this.imagemService.deleteImagens(
          {
            veiculoId: veiculo.id,
            ids: data.imagensExcluir.map((imagem) => imagem),
          },
          this.dataSource.manager,
        );
      }

      const imagensParaIncluir = data.imagensIncluir?.filter(Boolean) ?? [];

      if (imagensParaIncluir.length > 0) {
        const imagensCriadas = await Promise.all(
          imagensParaIncluir.map((imagem) =>
            this.imagemService.criar(
              {
                nome: `${veiculo.marca.replace(' ', '_')}-${veiculo.modelo.replace(' ', '_')}-${veiculo.id.split('-')[4]}`,
                url: imagem.url,
                veiculoId: veiculo.id,
              },
              this.dataSource.manager,
            ),
          ),
        );

        imagensAtuais = await this.dataSource.manager.save(imagensCriadas);
      }
    } catch (erroImagens) {
      console.error(
        'Houve um ou mais erros durante o processamento das imagens:',
        erroImagens,
      );
    }

    return { ...veiculo, imagens: imagensAtuais };
  }
}
