import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { RiskProfile } from '../risk-profile/entities/risk-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RiskProfile])],
  providers: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}