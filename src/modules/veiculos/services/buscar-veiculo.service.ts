import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { VeiculoBuscaReq, VeiculoSchema } from '../dto/veiculo.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import {
  UsuarioSchema,
  UsuarioType,
} from 'src/modules/usuarios/dto/usuario.dto';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepository: Repository<Veiculo>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(
    data: z.infer<typeof VeiculoBuscaReq>,
  ): Promise<z.infer<typeof VeiculoSchema>> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['imagens', 'usuario'],
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const usuario = await mapWithDecryptionDto<UsuarioType>(
      veiculo.usuario,
      UsuarioSchema,
      this.encryptionService,
      ['email', 'nome'],
    );

    return { ...veiculo, usuario: usuario };
  }
}
