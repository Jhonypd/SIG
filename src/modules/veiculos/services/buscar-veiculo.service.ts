import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Veiculo } from '../veiculos.entity';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { VeiculoBuscaReq, VeiculoSchema } from '../dto/veiculo.dto';
import { mapearComDescriptografia } from 'src/common/mapper/mapear-descriptografia.mapper.ts';
import { CriptografiaService } from 'src/common/encryption/criptografia.service';
import {
  UsuarioSchema,
  UsuarioType,
} from 'src/modules/usuarios/dto/usuario.dto';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculoRepositorio: Repository<Veiculo>,
    private readonly criptografiaService: CriptografiaService,
  ) {}

  /**
   * Busca um único veículo de um lojista específico.
   *
   * @param dados - Contém o ID do veículo e o ID do lojista autenticado.
   * @returns Veículo encontrado com as informações do usuário descriptografadas.
   * @throws NotFoundException - Caso o veículo não seja encontrado.
   */
  async execute(
    dados: z.infer<typeof VeiculoBuscaReq>,
  ): Promise<z.infer<typeof VeiculoSchema>> {
    // Busca o veículo com as relações necessárias
    const veiculo = await this.veiculoRepositorio.findOne({
      where: {
        id: dados.veiculoId,
        usuario: { id: dados.usuarioId },
      },
      relations: ['imagens', 'usuario'],
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Descriptografa os dados sensíveis do usuário
    const usuarioDescriptografado = await mapearComDescriptografia<UsuarioType>(
      veiculo.usuario,
      UsuarioSchema,
      this.criptografiaService,
      ['email', 'nome'],
    );

    return { ...veiculo, usuario: usuarioDescriptografado };
  }
}
