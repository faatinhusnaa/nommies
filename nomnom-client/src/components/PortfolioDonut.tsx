import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioDonutProps {
  tier: string;
}

const PORTFOLIO_MODELS: Record<string, any> = {
  AGGRESSIVE: {
    holdings: [
      { ticker: 'BOBA', desc: 'Brown Sugar Boba & Energy', pct: '50%' },
      { ticker: 'KURO', desc: 'Kuromi Mischief Bonds', pct: '25%' },
      { ticker: 'SPCY', desc: 'Spicy Hotpot Futures', pct: '15%' },
      { ticker: 'H2O', desc: 'Emergency Tap Water', pct: '10%' },
    ],
    chartData: [50, 25, 15, 10],
    chartColors: ['#f43f5e', '#c084fc', '#fb923c', '#38bdf8'],
  },
  GROWTH: {
    holdings: [
      { ticker: 'PURIN', desc: 'Custard Pudding Reserves', pct: '45%' },
      { ticker: 'TEA', desc: 'Artisan Matcha Lattes', pct: '30%' },
      { ticker: 'CINNA', desc: 'Cinnamoroll Cloud Buns', pct: '15%' },
      { ticker: 'HERB', desc: 'Chamomile Hedging', pct: '10%' },
    ],
    chartData: [45, 30, 15, 10],
    chartColors: ['#facc15', '#4ade80', '#93c5fd', '#a3e635'],
  },
  MODERATE: {
    holdings: [
      { ticker: 'POND', desc: 'Keroppi Lilypad Estates', pct: '35%' },
      { ticker: 'BAKE', desc: 'Buttery Croissants', pct: '35%' },
      { ticker: 'CHOC', desc: 'Dark Chocolate Vaults', pct: '20%' },
      { ticker: 'FIZZ', desc: 'Sparkling Mineral Water', pct: '10%' },
    ],
    chartData: [35, 35, 20, 10],
    chartColors: ['#22c55e', '#f59e0b', '#78350f', '#67e8f9'],
  },
  CONSERVATIVE: {
    holdings: [
      { ticker: 'REST', desc: 'Nap & Slumber Insurance', pct: '55%' },
      { ticker: 'CRACK', desc: 'Low-Sodium Rice Crackers', pct: '25%' },
      { ticker: 'PIE', desc: 'Hello Kitty Apple Pies', pct: '15%' },
      { ticker: 'TEA', desc: 'Warm Herbal Infusions', pct: '5%' },
    ],
    chartData: [55, 25, 15, 5],
    chartColors: ['#86efac', '#fde047', '#f87171', '#cbd5e1'],
  },
};

export const PortfolioDonut: React.FC<PortfolioDonutProps> = ({ tier }) => {
  const normalizedTier = tier?.toUpperCase() || 'GROWTH';
  const model = PORTFOLIO_MODELS[normalizedTier] || PORTFOLIO_MODELS.GROWTH;

  const data = {
    labels: model.holdings.map((h: any) => h.ticker),
    datasets: [
      {
        data: model.chartData,
        backgroundColor: model.chartColors,
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#f8d7df] shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-800">Snack Portfolio Asset Split</h3>
          <p className="text-xs text-gray-500">
            Assigned Profile: <span className="font-extrabold text-[#a11635]">{normalizedTier}</span>
          </p>
        </div>
        <span className="text-2xl">🍮</span>
      </div>

      {/* Side-by-side flex container: Donut on left, List on right */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="w-48 h-48 relative shrink-0">
          <Doughnut data={data} options={options} />
          {/* Inner circle badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl">🍰</span>
            <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mt-0.5">
              {normalizedTier}
            </span>
          </div>
        </div>

        {/* Snacks List Beside Donut */}
        <div className="flex-1 w-full space-y-2.5">
          {model.holdings.map((h: any, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-2.5 bg-[#fff8fa] border border-[#f9d7df] rounded-2xl transition hover:border-pink-300"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: model.chartColors[i] }}
                />
                <div>
                  <p className="text-xs font-bold text-gray-800">{h.ticker}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{h.desc}</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#a11635]">{h.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};