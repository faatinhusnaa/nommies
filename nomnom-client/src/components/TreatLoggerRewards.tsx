import React, { useState } from 'react';

export interface Reward {
  id: string;
  pointsNeeded: number;
  title: string;
  badge: string;
  perk: string;
  actionText: string;
}

export const REWARDS_LIST: Reward[] = [
  {
    id: 'halo',
    pointsNeeded: 50,
    title: 'VIP Halo Frame',
    badge: '👑',
    perk: 'Gilded pulsing avatar border & glowing executive aura (Active)',
    actionText: 'View Halo Effect',
  },
  {
    id: 'chroma',
    pointsNeeded: 100,
    title: 'Chroma Luminescence Nametag',
    badge: '🌈',
    perk: 'Shifting prismatic rainbow gradient nametag with luminescent drop shadow',
    actionText: 'Inspect Chroma Glow',
  },
  {
    id: 'overlord',
    pointsNeeded: 200,
    title: 'Snack Overlord Aura',
    badge: '✨',
    perk: 'Animated star sparkles, radiant indigo particle aura, and diamond tier syndicate badge',
    actionText: 'Equip Overlord Aura',
  },
  {
    id: 'tycoon',
    pointsNeeded: 500,
    title: 'Moon Dairy Tycoon',
    badge: '🛸',
    perk: 'Deed to 1% of the Moon Dairy Lands with floating neon crown & holographic marquee card',
    actionText: 'Claim Moon Deed',
  },
];

const TREAT_OPTIONS = [
  { name: 'Brown Sugar Boba', points: 30, icon: '🧋' },
  { name: 'Custard Pudding', points: 20, icon: '🍮' },
  { name: 'Warm Croissant', points: 25, icon: '🥐' },
  { name: 'Matcha Softserve', points: 35, icon: '🍦' },
];

interface TreatLoggerProps {
  currentPoints: number;
  userName?: string;
  onUpdatePoints: (newPoints: number) => void;
}

export const TreatLoggerRewards: React.FC<TreatLoggerProps> = ({
  currentPoints,
  userName = 'Executive Tycoon',
  onUpdatePoints,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleLogTreat = (treat: (typeof TREAT_OPTIONS)[0]) => {
    const updated = currentPoints + treat.points;
    onUpdatePoints(updated);
    setStatus(`+${treat.points} pts added! Enjoy the ${treat.name}! ✨`);
    setTimeout(() => setStatus(''), 2500);
  };

  const nextReward =
    REWARDS_LIST.find((r) => r.pointsNeeded > currentPoints) ||
    REWARDS_LIST[REWARDS_LIST.length - 1];
  const progressPercent = Math.min(
    100,
    Math.round((currentPoints / nextReward.pointsNeeded) * 100)
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f8d7df] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#a11635] flex items-center gap-2">
            <span>🎁</span> Treat Rewards & Executive Club
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Log your treats to unlock live cosmetic upgrades and platform prestige
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Executive Balance
          </span>
          <p className="text-2xl font-black text-[#a11635]">{currentPoints} pts</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#fff8fa] border border-[#f9d7df] rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-700">
          <span>
            Next Privilege:{' '}
            <strong className="text-[#a11635]">{nextReward.title}</strong>
          </span>
          <span>
            {currentPoints} / {nextReward.pointsNeeded} pts
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#a11635] h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Treat Logger Buttons */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-gray-700">Log A Treat Intake</span>
          {status && (
            <span className="text-xs font-semibold text-[#a11635] animate-fade-in">
              {status}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TREAT_OPTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleLogTreat(item)}
              className="p-3 bg-[#fffcfd] border border-[#f8d7df] hover:border-[#a11635] hover:bg-[#ffeef2] rounded-2xl transition flex flex-col items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold text-gray-800 text-center">{item.name}</span>
              <span className="text-[10px] font-extrabold text-[#a11635] bg-[#fff0f4] px-2 py-0.5 rounded-full border border-[#fbd0db]">
                +{item.points} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Unlocked Milestones Checklist */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-gray-700">Executive Milestone Privileges</h4>
        <div className="space-y-2.5">
          {REWARDS_LIST.map((r) => {
            const unlocked = currentPoints >= r.pointsNeeded;
            return (
              <div
                key={r.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition gap-3 ${
                  unlocked
                    ? 'bg-[#fff5f7] border-[#f9c2cf] shadow-2xs'
                    : 'bg-gray-50/70 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.badge}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-800">{r.title}</p>
                      <span className="text-[9px] font-extrabold text-[#a11635] bg-white border border-[#fbd0db] px-1.5 py-0.2 rounded-md">
                        {r.pointsNeeded} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">{r.perk}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {unlocked ? (
                    <button
                      onClick={() => setActiveModal(r.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>✨</span> {r.actionText}
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                      LOCKED 🔒
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 50 Pts Modal: VIP Halo Frame */}
      {activeModal === 'halo' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#f9d7df] shadow-2xl text-center space-y-3">
            <span className="text-4xl">👑</span>
            <h3 className="text-base font-black text-[#a11635]">VIP Halo Frame Active</h3>
            <p className="text-xs text-gray-600">
              Your profile avatar is crowned with a 24K gilded pulsing halo border visible across the syndicate wire.
            </p>
            <div className="py-2">
              <div className="w-16 h-16 mx-auto rounded-full ring-4 ring-amber-400 ring-offset-2 bg-pink-100 flex items-center justify-center text-3xl shadow-lg shadow-amber-200 animate-pulse">
                👑
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-[#a11635] hover:bg-[#850f29] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Magnificent!
            </button>
          </div>
        </div>
      )}

      {/* 100 Pts Modal: Chroma Luminescence */}
      {activeModal === 'chroma' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-fuchsia-300 shadow-2xl text-center space-y-3">
            <span className="text-4xl">🌈</span>
            <span className="text-[10px] bg-fuchsia-100 text-fuchsia-800 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              100 PTS UNLOCKED
            </span>
            <h3 className="text-base font-black text-gray-900">Chroma Luminescence Active</h3>
            <div className="py-3 px-4 bg-gray-900 rounded-2xl border border-gray-700 text-center">
              <p className="text-sm font-black rainbow-nametag tracking-wide">
                {userName}
              </p>
              <span className="text-[10px] text-fuchsia-300 font-mono mt-1 block">
                PRISMATIC DROP GLOW ENABLED
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Your display name is now illuminated with continuous rainbow animations throughout all live modules.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-[#a11635] hover:bg-[#850f29] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Equip Nametag
            </button>
          </div>
        </div>
      )}

      {/* 200 Pts Modal: Snack Overlord Aura */}
      {activeModal === 'overlord' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1b4b] text-white rounded-3xl p-6 max-w-sm w-full border border-indigo-400 shadow-2xl text-center space-y-3">
            <span className="text-4xl">✨</span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              200 PTS UNLOCKED
            </span>
            <h3 className="text-base font-black text-indigo-200">Snack Overlord Aura</h3>
            <div className="p-4 bg-indigo-950/80 rounded-2xl border border-indigo-500/40 space-y-2">
              <div className="flex justify-center items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="font-black text-amber-300 text-sm tracking-wide">DIAMOND SYNDICATE</span>
                <span className="text-xl">✨</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Radiant indigo particle effects and executive priority broadcast routing applied to all wire dispatches.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Radiate Overlord Aura
            </button>
          </div>
        </div>
      )}

      {/* 500 Pts Modal: Moon Dairy Tycoon */}
      {activeModal === 'tycoon' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b0f19] text-white rounded-3xl p-6 max-w-sm w-full border border-purple-500 shadow-2xl text-center space-y-3">
            <div className="flex justify-center items-center gap-2 text-3xl">
              <span>🛸</span>
              <span className="text-4xl">🌕</span>
              <span>👑</span>
            </div>
            <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/40 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              500 PTS APEX TIER
            </span>
            <h3 className="text-base font-black text-purple-300">Moon Dairy Lands Title Deed</h3>
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-purple-500/40 text-left text-xs space-y-1.5 text-gray-300">
              <p><strong className="text-white">Grantee:</strong> {userName}</p>
              <p><strong className="text-white">Sector:</strong> Mare Tranquillitatis (Sector 7-Pudding)</p>
              <p><strong className="text-white">Allotment:</strong> 1.00% Lunar Surface Pasture Rights</p>
              <p><strong className="text-white">Perk:</strong> Floating Neon Crown + Holographic Wire Pass</p>
              <p className="text-[10px] text-purple-300/80 italic pt-1">
                Authorized for space cream churning and zero-gravity boba extraction.
              </p>
            </div>
            <button
              onClick={() => {
                window.print();
                setActiveModal(null);
              }}
              className="w-full py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
            >
              Print Deed Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};