import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Veiculo } from '../veiculos/veiculos.entity';

@Entity()
export class Imagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToOne(() => Veiculo, (veiculo) => veiculo.imagens)
  veiculo: Veiculo;
}
