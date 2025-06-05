import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { VeiculoBuscasSchemaDto, VeiculoSchemaDto } from '../dto/veiculo.dto';
import { mapWithDecryptionDto } from 'src/common/mapper/map-decryption.mapper';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import {
  UsuarioSchemaDto,
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
    data: z.infer<typeof VeiculoBuscasSchemaDto>,
  ): Promise<z.infer<typeof VeiculoSchemaDto>> {
    const veiculo = await this.veiculoRepository.findOne({
      where: { id: data.veiculoId, usuario: { id: data.usuarioId } },
      relations: ['imagens', 'usuario'],
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    const usuario = await mapWithDecryptionDto<UsuarioType>(
      veiculo.usuario,
      UsuarioSchemaDto,
      this.encryptionService,
      ['email', 'nome'],
    );

    return { ...veiculo, usuario: usuario };
  }
}
