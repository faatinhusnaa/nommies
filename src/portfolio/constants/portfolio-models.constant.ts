import { RiskTier } from '../../risk-profile/entities/risk-profile.entity';

export interface AssetAllocation {
  assetClass: string;
  ticker: string;
  weightPercentage: number;
}

export interface ModelPortfolio {
  name: string;
  riskTier: RiskTier;
  expectedAnnualReturn: string;
  description: string;
  allocations: AssetAllocation[];
}

export const PORTFOLIO_MODELS: Record<RiskTier, ModelPortfolio> = {
  [RiskTier.CONSERVATIVE]: {
    name: 'Preservation of Capital Portfolio',
    riskTier: RiskTier.CONSERVATIVE,
    expectedAnnualReturn: '3.5% - 5.0%',
    description: 'Focuses on capital protection, stable dividends, and inflation resistance.',
    allocations: [
      { assetClass: 'Government & Corporate Bonds', ticker: 'BND', weightPercentage: 70 },
      { assetClass: 'Cash & Short-Term Money Market', ticker: 'SHV', weightPercentage: 20 },
      { assetClass: 'Global Large-Cap Equities', ticker: 'VT', weightPercentage: 10 },
    ],
  },
  [RiskTier.MODERATE]: {
    name: 'Balanced Income & Growth Portfolio',
    riskTier: RiskTier.MODERATE,
    expectedAnnualReturn: '5.5% - 7.5%',
    description: 'Even distribution designed to balance downside mitigation with consistent equity appreciation.',
    allocations: [
      { assetClass: 'Total World Stock Index', ticker: 'VT', weightPercentage: 50 },
      { assetClass: 'Intermediate Aggregate Bonds', ticker: 'BND', weightPercentage: 40 },
      { assetClass: 'Cash Equivalent', ticker: 'SHV', weightPercentage: 10 },
    ],
  },
  [RiskTier.GROWTH]: {
    name: 'Core Global Growth Portfolio',
    riskTier: RiskTier.GROWTH,
    expectedAnnualReturn: '7.5% - 10.0%',
    description: 'Oriented toward capital appreciation over 5+ years with moderate tolerance for market volatility.',
    allocations: [
      { assetClass: 'US Large-Cap Equity (S&P 500)', ticker: 'VOO', weightPercentage: 50 },
      { assetClass: 'International Developed Markets', ticker: 'VEA', weightPercentage: 25 },
      { assetClass: 'Emerging Markets', ticker: 'VWO', weightPercentage: 15 },
      { assetClass: 'Aggregate Bond Index', ticker: 'BND', weightPercentage: 10 },
    ],
  },
  [RiskTier.AGGRESSIVE]: {
    name: 'Maximum Equity Capital Accumulator',
    riskTier: RiskTier.AGGRESSIVE,
    expectedAnnualReturn: '10.0% - 13.0%',
    description: 'Maximum long-term compounding through total equity exposure and thematic technology focus.',
    allocations: [
      { assetClass: 'US Total Stock Market', ticker: 'VTI', weightPercentage: 50 },
      { assetClass: 'Nasdaq 100 / Technology ETF', ticker: 'QQQ', weightPercentage: 30 },
      { assetClass: 'Emerging High-Growth Markets', ticker: 'VWO', weightPercentage: 20 },
    ],
  },
};