import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Veiculo } from '../veiculos/veiculos.entity';

@Entity()
export class Imagem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  url: string;

  @ManyToOne(() => Veiculo, (veiculo) => veiculo.imagens, {
    onDelete: 'CASCADE',
  })
  veiculo: Veiculo;
}
