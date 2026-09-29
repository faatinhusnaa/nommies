import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { User } from '../../users/entities/user.entity';

export enum RiskTier {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  GROWTH = 'GROWTH',
  AGGRESSIVE = 'AGGRESSIVE',
}

@Entity('risk_profiles')
export class RiskProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  score: number;

  @Column({
    type: 'enum',
    enum: RiskTier,
    default: RiskTier.MODERATE,
  })
  tier: RiskTier;

  @Column({ type: 'jsonb', nullable: true })
  answers: Record<string, any>;

  // Use string reference 'User' instead of the class object
  @OneToOne('User', (user: User) => user.riskProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}