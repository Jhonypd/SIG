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
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly imageService: ImagemService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
  ) {}

  async execute(
    data: z.infer<typeof VeiculoCriarReq>,
    lojistaId: z.infer<typeof VeiculoBuscaReq>['usuarioId'],
  ): Promise<z.infer<typeof VeiculoSchema>> {
    const validation = VeiculoCriarReq.safeParse(data);

    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const Veiculo = this.veiculoRepository.create({
      ...data.veiculo,
      usuario: { id: lojistaId },
      imagens: [],
    });

    const veiculoSalvo = await this.veiculoRepository.save(Veiculo);

    if (data.imagens && data.imagens.length > 0) {
      await Promise.all(
        data.imagens.map(
          async (imagem) =>
            await this.imageService.criar({
              url: imagem.url,
              veiculoId: veiculoSalvo.id,
              nome: `${veiculoSalvo.marca.replace(' ', '_')}-${veiculoSalvo.modelo.replace(' ', '_')}-${veiculoSalvo.id.split('-')[4]}`,
            }),
        ),
      );
    }

    const veiculoCriado = await this.buscarVeiculoService.execute({
      veiculoId: veiculoSalvo.id,
      usuarioId: lojistaId,
    });

    return veiculoCriado ? veiculoCriado : veiculoSalvo;
  }
}
