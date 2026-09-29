import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskProfile } from '../risk-profile/entities/risk-profile.entity';
import { PORTFOLIO_MODELS, ModelPortfolio } from './constants/portfolio-models.constant';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(RiskProfile)
    private readonly riskProfileRepository: Repository<RiskProfile>,
  ) {}

  async getRecommendedPortfolio(userId: any): Promise<ModelPortfolio> {
    const profile = await this.riskProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('No investor risk assessment found for this user.');
    }

    return PORTFOLIO_MODELS[profile.tier];
  }
}