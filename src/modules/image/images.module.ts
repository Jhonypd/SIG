import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './images.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  //   providers: [VehiclesService],
  //   controllers: [VehiclesController],
})
export class ImageModule {}
