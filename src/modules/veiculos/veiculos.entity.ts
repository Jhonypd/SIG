import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';
import { Imagem } from '../imagens/imagens.entity';

@Entity()
export class Veiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: number;

  @Column('decimal')
  preco: number;

  @Column({ nullable: true })
  descricao: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.veiculos)
  usuario: Usuario;

  @OneToMany(() => Imagem, (imagem) => imagem.veiculo)
  imagens: Imagem[];
}
