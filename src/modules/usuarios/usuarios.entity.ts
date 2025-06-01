import { Veiculo } from '../veiculos/veiculos.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  hashEmail: string;

  @Column()
  senha: string;

  @OneToMany(() => Veiculo, (veiculo) => veiculo.usuario)
  veiculos: Veiculo[];
}
