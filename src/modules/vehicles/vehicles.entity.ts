@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.vehicles)
  user: User;

  @OneToMany(() => Image, (image) => image.vehicle)
  images: Image[];
}
