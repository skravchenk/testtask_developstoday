import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Holiday } from './holiday.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Holiday, (holiday) => holiday.user, { cascade: true })
  holidays: Holiday[];
}