import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import type { RiskProfile } from '../../risk-profile/entities/risk-profile.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // src/users/entities/user.entity.ts
@Column({ type: 'int', default: 0, name: 'treat_points' })
treat_points: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('RiskProfile', (riskProfile: RiskProfile) => riskProfile.user)
  riskProfile: RiskProfile;
}