import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { RespostaPadrao } from 'src/common/interfaces/response.interface';
import {
  UsuarioDto,
  UsuarioSchema,
  VeiculoSchemaDto,
} from '../dto/veiculo.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { EncryptionService } from 'src/common/encryption/encryption.service';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(data: {
    veiculoId: string;
    usuarioId: string;
  }): Promise<RespostaPadrao<z.infer<typeof VeiculoSchemaDto>>> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['imagens', 'usuario'],
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const usuario = await mapWithDecryptionDto<UsuarioDto>(
      veiculo.usuario,
      UsuarioSchema,
      this.encryptionService,
      ['email', 'nome'],
    );

    return {
      Resultado: {
        ...veiculo,
        usuario: usuario,
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
