import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Imagem } from './imagens.entity';
import { EntityManager, Repository } from 'typeorm';
import { z } from 'zod';
import { CriarImagemDto } from './dto/criar-imagem.dto';

const idSchema = z.object({ id: z.string().uuid() });
const deleteImagesSchema = z.object({
  veiculoId: z.string(),
  ids: z.array(z.string()).min(1, 'Deve conter pelo menos um ID de imagem'),
});

@Injectable()
export class ImagemService {
  constructor(
    @InjectRepository(Imagem)
    private readonly imagemRepository: Repository<Imagem>,
  ) {}

  async criar(
    data: z.infer<typeof CriarImagemDto>,
    manager: EntityManager = this.imagemRepository.manager,
  ) {
    try {
      const validacao = CriarImagemDto.safeParse(data);

      if (!validacao.success) {
        throw new BadRequestException(validacao.error);
      }

      const novaImagem = await manager.create(Imagem, {
        ...data,
        veiculo: { id: data.veiculoId },
      });

      await manager.save(novaImagem);

      return novaImagem;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  

  async deleteImagens(
    data: z.infer<typeof deleteImagesSchema>,
    manager: EntityManager = this.imagemRepository.manager,
  ) {
    const validation = deleteImagesSchema.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const { veiculoId, ids } = data;

    let successCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        const imagem = await manager.findOne(Imagem, {
          where: {
            id,
            veiculo: { id: veiculoId },
          },
        });

        if (!imagem) {
          errors.push(
            `Imagem ${id} não encontrada para o veículo ${veiculoId}`,
          );
          continue;
        }

        await manager.remove(imagem);
        successCount++;
      } catch (err) {
        errors.push(`Erro ao excluir imagem ${id}: ${err.message}`);
      }
    }

    const total = ids.length;

    if (successCount === total) {
      return 'Imagens excluídas com sucesso.';
    } else {
      return `${successCount} de ${total} imagens excluídas.`;
    }
  }
}
