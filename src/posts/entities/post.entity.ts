import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { Reply } from './reply.entity';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  votes: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @OneToMany(() => Reply, (reply) => reply.post, { cascade: true })
  replies: Reply[];

  @CreateDateColumn()
  createdAt: Date;
}