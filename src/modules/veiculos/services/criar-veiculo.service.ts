import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import {
  VeiculoBuscaReq,
  VeiculoSchema,
  VeiculoCriarReq,
} from '../dto/veiculo.dto';
import { BuscarVeiculoService } from './buscar-veiculo.service';

export class CriarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepositorio: Repository<Veiculo>,
    private readonly servicoImagem: ImagemService,
    private readonly servicoBuscarVeiculo: BuscarVeiculoService,
  ) {}

  /**
   * Cria um novo veículo para o lojista autenticado, com validação e inclusão de imagens.
   *
   * @param dados - Dados do veículo a serem criados.
   * @param idLojista - ID do lojista autenticado.
   * @returns O veículo criado com os dados completos e imagens associadas.
   * @throws BadRequestException - Caso a validação dos dados falhe.
   */
  async execute(
    dados: z.infer<typeof VeiculoCriarReq>,
    idLojista: z.infer<typeof VeiculoBuscaReq>['usuarioId'],
  ): Promise<z.infer<typeof VeiculoSchema>> {
    // Validação dos dados do veículo com zod
    const validacao = VeiculoCriarReq.safeParse(dados);
    if (!validacao.success) {
      throw new BadRequestException(validacao.error);
    }

    // Cria a entidade Veículo com associação ao usuário
    // lojista e lista vazia de imagens inicialmente
    const novoVeiculo = this.veiculoRepositorio.create({
      ...dados.veiculo,
      usuario: { id: idLojista },
      imagens: [],
    });

    // Salva o veículo no banco
    const veiculoSalvo = await this.veiculoRepositorio.save(novoVeiculo);

    // Se houver imagens, cria as entradas relacionadas para cada
    //  imagem
    if (dados.imagens && dados.imagens.length > 0) {
      await Promise.all(
        dados.imagens.map(async (imagem) => {
          return await this.servicoImagem.criar({
            url: imagem.url,
            veiculoId: veiculoSalvo.id,
            nome: `${veiculoSalvo.marca.replace(' ', '_')}-${veiculoSalvo.modelo.replace(' ', '_')}-${veiculoSalvo.id.split('-')[4]}`,
          });
        }),
      );
    }

    // Busca o veículo criado com todos os dados e imagens associadas
    // para retorno
    const veiculoCompleto = await this.servicoBuscarVeiculo.execute({
      veiculoId: veiculoSalvo.id,
      usuarioId: idLojista,
    });

    // Retorna o veículo completo, ou o salvo diretamente caso
    // não encontre o completo
    return veiculoCompleto ? veiculoCompleto : veiculoSalvo;
  }
}
