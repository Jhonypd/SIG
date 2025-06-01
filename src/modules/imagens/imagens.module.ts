import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagem } from './imagens.entity';
import { ImagemService } from './imagens.service';

@Module({
  imports: [TypeOrmModule.forFeature([Imagem])],
  providers: [ImagemService],
  controllers: [],
  exports: [ImagemService],
})
export class ImagemModule {}
