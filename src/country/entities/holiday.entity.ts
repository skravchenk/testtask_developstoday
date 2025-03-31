import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryCode: string;

  @Column()
  year: number;

  @Column('simple-array')
  holidays: string[];

  @ManyToOne(() => User, (user) => user.holidays)
  user?: User;
}
