import { Repository } from 'typeorm';
import { Veiculo } from '../veiculos.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagemService } from 'src/modules/imagens/imagens.service';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { formatException } from 'src/common/helper/formatarException.helper';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { VeiculoSchemaDto } from '../dto/veiculo.dto';
import { BuscarVeiculoService } from './buscar-veiculo.service';
import { CriarVeiculoDto } from '../dto/criar-veiculo.dto';

export class CriarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly imageService: ImagemService,
    private readonly buscarUmVeiculoService: BuscarVeiculoService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    data: z.infer<typeof CriarVeiculoDto>,
  ): Promise<RespostaPadrao<z.infer<typeof VeiculoSchemaDto>>> {
    try {
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

      const response = await this.buscarUmVeiculoService.execute({
        veiculoId: veiculoSalvo.id,
        usuarioId: data.lojistaId,
      });

      return {
        Resultado: {
          ...response,
          usuario: {
            ...response.usuario,
            nome: this.encryptionService.decrypt(response.usuario.nome),
            email: this.encryptionService.decrypt(response.usuario.email),
          },
        },
        Sucesso: true,
        Mensagem: 'Veículo criado com sucesso',
        Detalhe: null,
        CodigoRetorno: 200,
        TipoRetorno: 1,
        TempoResposta: 0,
      };
    } catch (error) {
      const detalhe = formatException(error);

      return {
        Resultado: null,
        Sucesso: false,
        Mensagem: 'Falha ao criar veículo',
        Detalhe: detalhe,
        CodigoRetorno: 500,
        TipoRetorno: 1,
        TempoResposta: 0,
      };
    }
  }
}
