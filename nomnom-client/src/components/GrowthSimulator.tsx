// src/components/GrowthSimulator.tsx (or similar path)
import React, { useState, useMemo } from 'react';

export const GrowthSimulator: React.FC = () => {
  const [dailyBudget, setDailyBudget] = useState<number>(3);
  const [years, setYears] = useState<number>(1);

  // Calculations
  const totalDays = years * 365;
  const totalCapitalInvested = dailyBudget * totalDays;
  const treatCost = 3.73;
  const treatsAccumulated = Math.floor(
    (dailyBudget / treatCost) * totalDays * (1 + years * 0.05)
  );

  // Dynamic SVG calculation tied to sliders
  const { pathData, areaData, endPoint } = useMemo(() => {
    const width = 500;
    const height = 180;
    const paddingX = 20;
    const paddingBottom = 20;
    const paddingTop = 25;
    const pointsCount = 20;

    const points: [number, number][] = [];

    // Scale growth factor dynamically based on years (1 to 15) and budget (1 to 50)
    const growthIntensity = 1.0 + (years / 15) * 0.8;
    const heightScale = Math.min(1, 0.4 + (dailyBudget / 50) * 0.6);

    for (let i = 0; i <= pointsCount; i++) {
      const progress = i / pointsCount;
      const x = paddingX + progress * (width - 2 * paddingX);

      // Curve formula: progress curve scaled by current parameters
      const normalizedCurve = Math.pow(progress, growthIntensity);
      const availableHeight = (height - paddingBottom - paddingTop) * heightScale;
      
      // Wobble effect for cute snack stock look
      const wobble = Math.sin(progress * Math.PI * 4) * (2 + years * 0.3);

      const y = (height - paddingBottom) - (normalizedCurve * availableHeight) + wobble;
      points.push([x, Math.max(paddingTop, Math.min(height - paddingBottom, y))]);
    }

    const line = points.reduce(
      (acc, [x, y], idx) => (idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`),
      ''
    );

    const last = points[points.length - 1];
    const first = points[0];
    const area = `${line} L ${last[0]} ${height - paddingBottom} L ${first[0]} ${height - paddingBottom} Z`;

    return {
      pathData: line,
      areaData: area,
      endPoint: last,
    };
  }, [dailyBudget, years]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#fcd5de] shadow-xs max-w-4xl mx-auto my-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black text-[#a11635] flex items-center gap-2">
            <span>📈</span> Snack Compound Growth Engine
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Simulate your exponential snack hoarding and empire treasury
          </p>
        </div>
        <span className="text-2xl">🍰</span>
      </div>

      {/* Dynamic Graph Card */}
      <div className="bg-[#fffbfc] border border-[#fae2e7] rounded-3xl p-5 relative overflow-hidden mb-6">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
          <span>0 Snacks</span>
          <span className="text-[#a11635] font-black text-sm">
            {treatsAccumulated.toLocaleString()} Treats Accumulated
          </span>
        </div>

        <div className="relative w-full h-44">
          <svg
            viewBox="0 0 500 180"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="snackGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a11635" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a11635" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="20" y1="50" x2="480" y2="50" stroke="#fcd5de" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="20" y1="110" x2="480" y2="110" stroke="#fcd5de" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="20" y1="160" x2="480" y2="160" stroke="#fcd5de" strokeWidth="1.5" />

            {/* Dynamic Area Fill */}
            <path
              d={areaData}
              fill="url(#snackGrad)"
              className="transition-all duration-150 ease-out"
            />

            {/* Dynamic Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#a11635"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
            />

            {/* Dynamic Endpoint Dot */}
            <circle
              cx={endPoint[0]}
              cy={endPoint[1]}
              r="5"
              fill="#a11635"
              className="transition-all duration-150 ease-out"
            />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 mt-2">
          <span>Today</span>
          <span>{years} {years === 1 ? 'Year' : 'Years'} Out</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-7">
        <div>
          <div className="flex justify-between items-center mb-1 text-xs font-bold">
            <span className="text-gray-700">Daily Treat Budget (Fiat Currency)</span>
            <span className="text-[#a11635] font-black text-sm">${dailyBudget} / day</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(Number(e.target.value))}
            className="w-full accent-[#a11635] bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs font-bold">
            <span className="text-gray-700">Treat Hoarding Horizon</span>
            <span className="text-[#a11635] font-black text-sm">
              {years} {years === 1 ? 'year' : 'years'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[#a11635] bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#fffcfd] border border-[#fbe5ea] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
            Total Capital Invested
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-800">
            ${totalCapitalInvested.toLocaleString()}
          </span>
        </div>

        <div className="bg-[#fffcfd] border border-[#fbe5ea] rounded-2xl p-4 text-center">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
            Snack Reserve Vault
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#a11635]">
              {treatsAccumulated.toLocaleString()}
            </span>
            <span className="text-lg">🍮</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthSimulator;