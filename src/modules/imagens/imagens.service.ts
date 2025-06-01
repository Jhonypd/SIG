import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Imagem } from './imagens.entity';
import { Repository } from 'typeorm';
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

  async criar(data: z.infer<typeof CriarImagemDto>) {
    try {
      const validacao = CriarImagemDto.safeParse(data);

      if (!validacao.success) {
        throw new BadRequestException(validacao.error);
      }

      const newImagem = this.imagemRepository.create({
        ...data,
        veiculo: { id: data.veiculoId },
      });

      await this.imagemRepository.save(newImagem);

      return newImagem;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async buscarPorVeiculo(data: z.infer<typeof CriarImagemDto.shape.veiculoId>) {
    const validation = CriarImagemDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const images = await this.imagemRepository.findBy({
      veiculo: { id: data },
    });

    return images;
  }

  async buscarPorId(data: z.infer<typeof idSchema>) {
    const validation = idSchema.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const imagem = await this.imagemRepository.findOneBy({ id: data.id });

    if (!imagem) {
      throw new BadRequestException('Imagem nao encontrada');
    }
    return imagem;
  }

  async deleteImagens(data: z.infer<typeof deleteImagesSchema>) {
    const validation = deleteImagesSchema.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const { veiculoId, ids } = data;

    let successCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        const imagem = await this.imagemRepository.findOneBy({
          id,
          veiculo: { id: veiculoId },
        });

        if (!imagem) {
          errors.push(
            `Imagem ${id} não encontrada para o veículo ${veiculoId}`,
          );
          continue;
        }

        await this.imagemRepository.remove(imagem);
        successCount++;
      } catch (err) {
        errors.push(`Erro ao excluir imagem ${id}: ${err.mensagem}`);
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
