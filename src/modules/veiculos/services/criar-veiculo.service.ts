import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { VeiculoSchemaDto } from '../dto/veiculo.dto';
import { BuscarVeiculoService } from './buscar-veiculo.service';
import { CriarVeiculoDto } from '../dto/criar-veiculo.dto';
import { handleError } from 'src/common/helper/handler-error.helper';

export class CriarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly imageService: ImagemService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    data: z.infer<typeof CriarVeiculoDto>,
  ): Promise<RespostaPadrao<z.infer<typeof VeiculoSchemaDto>>> {
    const validation = CriarVeiculoDto.safeParse(data);

    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const Veiculo = this.veiculoRepository.create({
      ...data,
      usuario: { id: data.lojistaId },
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
              nome: veiculoSalvo.modelo,
            }),
        ),
      );
    }

    const response = await this.buscarVeiculoService.execute({
      veiculoId: veiculoSalvo.id,
      usuarioId: data.lojistaId,
    });

    return {
      Resultado: {
        ...(response.Resultado ? response.Resultado : veiculoSalvo),
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
