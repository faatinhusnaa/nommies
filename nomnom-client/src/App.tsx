import React, { useState, useEffect, useRef } from 'react';
import { PortfolioDonut } from './components/PortfolioDonut';
import { CommunityFeed } from './components/CommunityFeed';
import { apiRequest } from './services/api';
import { GrowthSimulator } from './components/GrowthSimulator';
import { TreatLoggerRewards } from './components/TreatLoggerRewards';

const SANRIO_AVATARS = [
  { id: 'purin', name: 'Pompompurin', emoji: '🐶', bg: '#fef08a' },
  { id: 'kitty', name: 'Hello Kitty', emoji: '🐱', bg: '#fecdd3' },
  { id: 'melody', name: 'My Melody', emoji: '🐰', bg: '#fbcfe8' },
  { id: 'kuromi', name: 'Kuromi', emoji: '😈', bg: '#e9d5ff' },
];

const DETAILED_QUIZ = [
  {
    question: "What is your primary snack runway & treat urgency?",
    options: [
      { text: "Under 10 minutes (Immediate emergency boba deficit)", points: 5 },
      { text: "Right after lunch (Standard afternoon sugar protocol)", points: 12 },
      { text: "Late evening raid (Disciplined sweet craving)", points: 18 },
      { text: "Diamond-hand fasting until 2 AM midnight ramen & milk tea", points: 25 },
    ]
  },
  {
    question: "The café is sold out of cinnamon rolls and matcha lattes. What is your move?",
    options: [
      { text: "Panic starve and drop to the floor dramatically", points: 5 },
      { text: "Settle for plain lukewarm tap water and sigh loudly", points: 12 },
      { text: "Hold tight and wait for the next fresh batch to bake", points: 18 },
      { text: "Hostile takeover: Buy out their entire chocolate cookie inventory", points: 25 },
    ]
  },
  {
    question: "How reliable is your current pantry & treat reserve vault?",
    options: [
      { text: "No emergency pantry; relying solely on impulse vending machines", points: 5 },
      { text: "1-3 days of emergency snacks stored in desk drawers", points: 12 },
      { text: "Fully stocked snack cabinet with emergency chocolate reserves", points: 18 },
      { text: "Commercial-grade walk-in freezer packed with ice cream & dumplings", points: 25 },
    ]
  },
  {
    question: "What percentage of monthly capital is allocated strictly to sweet treats?",
    options: [
      { text: "Less than 5% (Severe snack austerity)", points: 5 },
      { text: "5% to 15% (Casual treat enthusiast)", points: 12 },
      { text: "15% to 30% (Standard boba & pastry reallocation)", points: 18 },
      { text: "Over 30% (Living purely on high-fructose corn syrup & dreams)", points: 25 },
    ]
  },
  {
    question: "Which gastronomic empire strategy matches your ambitions?",
    options: [
      { text: "Preservation: Low-sodium rice crackers and warm chamomile tea", points: 5 },
      { text: "Balanced: 50% artisan croissants and 50% sparkling water", points: 12 },
      { text: "Growth: Custard puddings, matcha lattes, and high-yield pastries", points: 18 },
      { text: "Tycoon Overlord: Brown sugar boba, hotpot futures, and moon dairy farms", points: 25 },
    ]
  }
];

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  treat_points?: number;
  treatPoints?: number;
  points?: number;
  avatar?: string;
  riskProfile?: any;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [showFeed, setShowFeed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [user, setUser] = useState<any>(() => {
    const cached = localStorage.getItem('user_profile');
    return cached ? JSON.parse(cached) : null;
  });

  // Dynamic Reward Tiers
  const points = user?.treat_points || user?.points || 0;
  const hasVipHalo = points >= 50;
  const hasRainbowNametag = points >= 100;
  const hasSugarOverlord = points >= 200;
  const hasMoonTycoon = points >= 500;

  // Edit Profile Form
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatarEmoji, setEditAvatarEmoji] = useState(user?.avatarEmoji || '🐶');
  const [editAvatarImage, setEditAvatarImage] = useState(user?.avatarImage || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editMsg, setEditMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Admin Console State
  const [adminUsers, setAdminUsers] = useState<ManagedUser[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const [investorData, setInvestorData] = useState(() => {
    const cached = localStorage.getItem('investor_tier');
    return cached ? JSON.parse(cached) : {
      tier: 'GROWTH',
      description: 'Targeted snack portfolio designed for custard capital growth while controlling sugar crashes.',
      riskScore: 78,
      equities: '70% Treats',
      fixedIncome: '30% Tea Hedging',
    };
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('investor_tier', JSON.stringify(investorData));
  }, [investorData]);

  // Synchronize authenticated user profile with latest database values
  useEffect(() => {
    const syncProfile = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) return;

      try {
        const freshUser = await apiRequest('/users/me');
        if (freshUser) {
          const freshPts = freshUser.treat_points ?? freshUser.points ?? 0;
          setUser((prev: any) => ({
            ...prev,
            ...freshUser,
            treat_points: freshPts,
            points: freshPts,
          }));
        }
      } catch (err) {
        console.error('Failed to sync profile on mount:', err);
      }
    };

    syncProfile();
  }, [token]);

  // --- Admin User Actions ---
  const loadAdminUsers = async () => {
    setAdminLoading(true);
    setAdminSearch('');
    try {
      const data = await apiRequest('/users');
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setAdminUsers(list);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      alert(err.message || 'Failed to fetch user list from backend');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleInspectUser = async (id: number) => {
    try {
      const single = await apiRequest(`/users/${id}`);
      setSelectedUser(single);
    } catch (err: any) {
      const found = adminUsers.find((u) => u.id === id) || null;
      setSelectedUser(found);
    }
  };

  const handleToggleRole = async (targetUser: ManagedUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await apiRequest(`/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });

      setAdminUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u))
      );

      if (selectedUser?.id === targetUser.id) {
        setSelectedUser({ ...selectedUser, role: nextRole });
      }
    } catch (err: any) {
      alert(`Failed to update role: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm(`Are you sure you want to permanently delete User #${id}?`)) {
      return;
    }

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
    }
  };

  // --- Reset / Set Points (Admin-Only) ---
  const handleResetPoints = async (targetUserId: number, initialPoints?: number) => {
    let newPointTotal: number;

    if (initialPoints !== undefined) {
      newPointTotal = initialPoints;
    } else {
      const input = window.prompt(`Enter new treat points for User #${targetUserId}:`, "150");
      if (input === null) return;
      newPointTotal = parseInt(input, 10);
      if (isNaN(newPointTotal)) {
        alert("Please enter a valid numeric value.");
        return;
      }
    }

    try {
      await apiRequest(`/users/${targetUserId}/reset-points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPointTotal }),
      });

      if (user?.id === targetUserId) {
        setUser((prev: any) => ({
          ...prev,
          treat_points: newPointTotal,
          points: newPointTotal,
        }));
      }

      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId
            ? { ...u, treat_points: newPointTotal, points: newPointTotal }
            : u
        )
      );

      if (selectedUser?.id === targetUserId) {
        setSelectedUser({ ...selectedUser, treat_points: newPointTotal, points: newPointTotal });
      }

      alert(`Successfully updated User #${targetUserId} points to ${newPointTotal} pts.`);
    } catch (err: any) {
      alert(`Failed to reset points: ${err.message || 'Unauthorized action'}`);
    }
  };

  // --- Auth Handling ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    try {
      if (authMode === 'register') {
        const payload = {
          name: authName,
          email: authEmail,
          password: authPassword,
        };

        const res = await apiRequest('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        localStorage.setItem('access_token', res.access_token);
        setToken(res.access_token);

        const registeredUser = {
          id: res.user?.id,
          name: res.user.name,
          role: res.user.role || 'user',
          email: res.user.email,
          avatarEmoji: '🐱',
          avatarImage: '',
          avatarBg: '#fecdd3',
          treat_points: 0,
          points: 0,
          hasCompletedQuiz: false,
        };

        setUser(registeredUser);
        localStorage.setItem('user_profile', JSON.stringify(registeredUser));
        setCurrentStep(0);
        setQuizScore(0);
      } else {
        const res = await apiRequest('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
          }),
        });

        localStorage.setItem('access_token', res.access_token);
        setToken(res.access_token);

        const cleanEmail = res.user.email.toLowerCase();
        const matchedAvatar = SANRIO_AVATARS.find(a => cleanEmail.includes(a.id));
        const userPts = res.user.treat_points ?? res.user.points ?? 0;

        const loggedInUser = {
          id: res.user?.id,
          name: res.user.name,
          role: res.user.role,
          email: res.user.email,
          avatarEmoji: matchedAvatar ? matchedAvatar.emoji : '🐶',
          avatarImage: '',
          avatarBg: matchedAvatar ? matchedAvatar.bg : '#fef08a',
          treat_points: userPts,
          points: userPts,
          hasCompletedQuiz: true,
        };

        setUser(loggedInUser);
        localStorage.setItem('user_profile', JSON.stringify(loggedInUser));
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('investor_tier');
    setToken(null);
    setUser(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatarImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (newPassword && !oldPassword) {
      setEditError('Current (old) password is required to set a new password.');
      return;
    }

    const selected = SANRIO_AVATARS.find(a => a.emoji === editAvatarEmoji);
    const updated = {
      ...user,
      name: editName,
      email: editEmail,
      avatarEmoji: editAvatarEmoji,
      avatarImage: editAvatarImage,
      avatarBg: selected ? selected.bg : user.avatarBg,
    };

    setUser(updated);
    localStorage.setItem('user_profile', JSON.stringify(updated));

    setEditMsg('Profile updated successfully! ✨');
    setTimeout(() => {
      setEditMsg('');
      setOldPassword('');
      setNewPassword('');
      setIsEditModalOpen(false);
    }, 1200);
  };

  // --- Quiz Submission & Tier Logic ---
  const handleAnswerQuestion = async (pointValue: number) => {
    const nextScore = quizScore + pointValue;

    if (currentStep + 1 < DETAILED_QUIZ.length) {
      setQuizScore(nextScore);
      setCurrentStep(currentStep + 1);
    } else {
      let finalTier = 'MODERATE';
      let desc = 'Balanced strategy seeking steady returns alongside chamomile tea downside hedging.';
      let eq = '50% Pastries';
      let fi = '50% Tea Hedging';

      if (nextScore <= 45) {
        finalTier = 'CONSERVATIVE';
        desc = 'Preservation profile prioritizing chamomile tea, low-sodium crackers, and sleep reserves.';
        eq = '20% Biscuits';
        fi = '80% Herbal Tea';
      } else if (nextScore <= 75) {
        finalTier = 'MODERATE';
        desc = 'Balanced allocation seeking flaky croissants and steady chocolate vaults.';
        eq = '50% Pastries';
        fi = '50% Sparkling Water';
      } else if (nextScore <= 105) {
        finalTier = 'GROWTH';
        desc = 'High-growth snack model packed with custard pudding reserves and matcha latte yields.';
        eq = '70% Treats';
        fi = '30% Tea Reserves';
      } else {
        finalTier = 'AGGRESSIVE';
        desc = 'Ultra-conviction tycoon tier: 100% Brown sugar boba, Kuromi mischief bonds, and lunar dairy land.';
        eq = '85% Boba & Hotpot';
        fi = '15% Emergency Water';
      }

      const calculatedData = {
        tier: finalTier,
        description: desc,
        riskScore: nextScore,
        equities: eq,
        fixedIncome: fi,
      };

      setInvestorData(calculatedData);
      localStorage.setItem('investor_tier', JSON.stringify(calculatedData));

      const finishedUser = {
        ...user,
        hasCompletedQuiz: true,
      };
      setUser(finishedUser);
      localStorage.setItem('user_profile', JSON.stringify(finishedUser));

      setIsQuizModalOpen(false);
      setCurrentStep(0);
      setQuizScore(0);
    }
  };

  // --- Screen 1: Unauthenticated Users ---
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#fdeef2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f9d7df] shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#fff0f3] border-2 border-[#f5b8c6] flex items-center justify-center text-3xl mx-auto mb-4">
            🍮
          </div>
          <h1 className="text-2xl font-black text-[#a11635] tracking-tight">NomNom Empire</h1>
          <p className="text-xs text-gray-500 mt-1 mb-6">Global Treat & Billionaire Advisory</p>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
            {authMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Executive Name</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Baron von Pudding"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#edd1d8] text-xs focus:ring-1 focus:ring-[#a11635] outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="purin@sanrio.dev"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#edd1d8] text-xs focus:ring-1 focus:ring-[#a11635] outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-gray-700">Passcode</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[10px] text-[#a11635] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Passcode?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#edd1d8] text-xs focus:ring-1 focus:ring-[#a11635] outline-none"
              />
            </div>

            {authError && <p className="text-xs font-semibold text-rose-600">{authError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-sm mt-2 cursor-pointer"
            >
              {authMode === 'login' ? 'Access Executive Terminal' : 'Onboard As Tycoon'}
            </button>
          </form>

          <div className="mt-5 text-xs text-gray-500">
            {authMode === 'login' ? "New to the syndicate? " : "Already established? "}
            <button
              onClick={() => {
                setAuthError('');
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              className="font-bold text-[#a11635] hover:underline cursor-pointer"
            >
              {authMode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </div>
        </div>

        {isForgotModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#f9d7df] shadow-xl text-left">
              <h3 className="text-base font-extrabold text-[#a11635] mb-1">Reset Passcode</h3>
              <p className="text-xs text-gray-500 mb-4">Enter your registered email to receive vault access keys:</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="purin@sanrio.dev"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none mb-3"
              />
              {forgotMsg && <p className="text-xs font-bold text-emerald-600 mb-3">{forgotMsg}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotMsg('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => setForgotMsg('Dispatching instructions to your carrier pigeon! 💌')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#a11635] text-white cursor-pointer"
                >
                  Send Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Screen 2: Mandatory Initial Quiz for Newly Registered Users ---
  if (!user.hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-[#fdeef2] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#f9d7df] shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-3xl block mb-2">🍰</span>
            <h2 className="text-xl font-black text-[#a11635]">Executive Gastronomic Evaluation</h2>
            <p className="text-xs text-gray-500 mt-1">
              Welcome, {user.name}! Complete this diagnostic to calibrate your snack asset allocation.
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a11635] bg-[#fff0f3] px-2.5 py-1 rounded-md">
              Question {currentStep + 1} of {DETAILED_QUIZ.length}
            </span>
            <span className="text-xs font-bold text-gray-400">
              {Math.round((currentStep / DETAILED_QUIZ.length) * 100)}% Completed
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-gray-900 mb-4 leading-snug">
            {DETAILED_QUIZ[currentStep].question}
          </h3>

          <div className="space-y-2.5">
            {DETAILED_QUIZ[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswerQuestion(opt.points)}
                className="w-full text-left p-3.5 rounded-2xl border border-[#fcd5de] bg-[#fff5f7] hover:bg-[#ffeef2] hover:border-[#a11635] transition flex items-center justify-between group cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800 group-hover:text-[#a11635]">
                  {opt.text}
                </span>
                <span className="text-xs text-[#a11635] font-extrabold opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Screen 3: Full Main Dashboard ---
  return (
    <div className="min-h-screen bg-[#fdeef2] flex flex-col items-center w-full overflow-x-hidden">
      {/* 1. Marquee Ticker */}
      <div className="w-full bg-[#82112d] text-white text-[11px] font-semibold tracking-wide py-1.5 overflow-hidden whitespace-nowrap shadow-sm no-print">
        <div className="animate-marquee flex gap-8">
          <span>BOBA/USD: <strong className="text-white">$6.50</strong> <span className="text-[#4ade80]">▲ +4.20%</span></span>
          <span>MATCHA LATTE: <strong className="text-white">$7.15</strong> <span className="text-[#4ade80]">▲ +2.15%</span></span>
          <span>PUDDING CARAMEL: <strong className="text-white">$3.80</strong> <span className="text-[#4ade80]">▲ +1.05%</span></span>
          <span>CINNAMON ROLLS: <strong className="text-white">$4.95</strong> <span className="text-[#f87171]">▼ -0.30%</span></span>
          <span>SPICY HOTPOT: <strong className="text-white">$34.00</strong> <span className="text-[#4ade80]">▲ +8.45%</span></span>
          <span>APPLE PIE INDEX: <strong className="text-white">$5.25</strong> <span className="text-[#4ade80]">▲ +0.90%</span></span>
          <span>RICE CRACKERS: <strong className="text-white">$2.10</strong> <span className="text-[#f87171]">▼ -1.15%</span></span>
          <span>CROISSANT: <strong className="text-white">$4.50</strong> <span className="text-[#4ade80]">▲ +3.10%</span></span>
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header className="w-full bg-white border-b border-[#f9d7df] px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] no-print">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-xl font-black text-[#a11635] tracking-tight">nommies laundering</h1>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden text-sm sm:text-base shadow-xs transition-all ${
              hasVipHalo
                ? 'ring-2 ring-amber-400 ring-offset-1 shadow-md shadow-amber-200 animate-float'
                : 'border border-[#f5b8c6]'
            }`}
            style={{ backgroundColor: user.avatarBg }}
          >
            {user.avatarImage ? (
              <img src={user.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.avatarEmoji
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setShowFeed(!showFeed)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showFeed ? 'bg-[#a11635] text-white shadow-sm' : 'bg-[#fee9ee] text-[#a11635] hover:bg-[#fedde5]'
            }`}
          >
            <span>💬</span> NomNom Wire
          </button>

          {user.role === 'admin' && (
            <button
              onClick={() => {
                loadAdminUsers();
                setIsAdminModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-[#edd1d8] hover:bg-gray-50 transition cursor-pointer"
            >
              Admin Console
            </button>
          )}

          <button
            onClick={() => {
              setEditName(user.name);
              setEditEmail(user.email);
              setEditAvatarEmoji(user.avatarEmoji);
              setEditAvatarImage(user.avatarImage || '');
              setOldPassword('');
              setNewPassword('');
              setEditError('');
              setIsEditModalOpen(true);
            }}
            className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-sm cursor-pointer"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-[#edd1d8] hover:bg-gray-50 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* 3. Main Content View */}
      <main className="w-full max-w-4xl px-3 sm:px-4 py-6 space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#f9d7df] shadow-sm space-y-6 print-card">
          {/* User Profile Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b sm:border-b-0 border-[#fef0f3]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 flex items-center justify-center text-2xl sm:text-3xl shadow-inner overflow-hidden transition-all ${
                  hasMoonTycoon
                    ? 'ring-4 ring-purple-500 ring-offset-2 shadow-xl shadow-purple-300 animate-bounce'
                    : hasSugarOverlord
                    ? 'ring-4 ring-indigo-400 ring-offset-2 shadow-lg shadow-indigo-200'
                    : hasVipHalo
                    ? 'ring-4 ring-amber-400 ring-offset-2 shadow-lg shadow-amber-200 animate-pulse'
                    : 'border-2 border-[#f5b8c6]'
                }`}
                style={{ backgroundColor: user.avatarBg }}
              >
                {user.avatarImage ? (
                  <img src={user.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.avatarEmoji
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Dynamic Shimmering Rainbow Nametag */}
                  <h2
                    className={`text-base sm:text-lg font-black tracking-tight ${
                      hasRainbowNametag ? 'rainbow-nametag text-transparent' : 'text-gray-900'
                    }`}
                  >
                    {user.name}
                  </h2>

                  <span className="text-[10px] font-extrabold uppercase bg-[#fdeef2] text-[#a11635] px-2 py-0.5 rounded-md border border-[#f9d7df]">
                    {user.role}
                  </span>

                  {/* Level 1: 50 Pts */}
                  {hasVipHalo && (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                      👑 VIP Halo
                    </span>
                  )}

                  {/* Level 2: 100 Pts */}
                  {hasRainbowNametag && (
                    <span className="text-[10px] font-extrabold uppercase bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 px-2 py-0.5 rounded-md animate-pulse">
                      🌈 Chroma Glow
                    </span>
                  )}

                  {/* Level 3: 200 Pts */}
                  {hasSugarOverlord && (
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-md">
                      ✨ Sugar Overlord
                    </span>
                  )}

                  {/* Level 4: 500 Pts */}
                  {hasMoonTycoon && (
                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md">
                      🛸 Moon Dairy Tycoon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditEmail(user.email);
                  setEditAvatarEmoji(user.avatarEmoji);
                  setEditAvatarImage(user.avatarImage || '');
                  setOldPassword('');
                  setNewPassword('');
                  setEditError('');
                  setIsEditModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-[#edd1d8] hover:bg-gray-50 transition text-center cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setQuizScore(0);
                  setIsQuizModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-700 border border-[#edd1d8] hover:bg-gray-50 transition text-center cursor-pointer"
              >
                Retake Quiz
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleResetPoints(user.id)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition text-center cursor-pointer"
                >
                  Reset My Points
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-sm text-center cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Investor Tier Card */}
          <div className="bg-[#fff1f4] border border-[#fcd5de] rounded-3xl p-5 sm:p-6 text-center space-y-4">
            <span className="inline-block text-[11px] font-bold text-[#a11635] bg-white px-3 py-1 rounded-full border border-[#fad2db] shadow-xs">
              Executive Nommies Tier
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#a11635] tracking-tight">{investorData.tier}</h3>
            <p className="text-xs text-gray-600 max-w-lg mx-auto font-medium">
              {investorData.description}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <div className="bg-white rounded-2xl py-3 px-1 sm:px-2 border border-[#fad2db] shadow-xs">
                <span className="block text-base sm:text-lg font-black text-[#a11635]">{investorData.riskScore}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">Sugar Score</span>
              </div>
              <div className="bg-white rounded-2xl py-3 px-1 sm:px-2 border border-[#fad2db] shadow-xs">
                <span className="block text-base sm:text-lg font-black text-[#a11635]">{investorData.equities}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">Target Sweets</span>
              </div>
              <div className="bg-white rounded-2xl py-3 px-1 sm:px-2 border border-[#fad2db] shadow-xs">
                <span className="block text-base sm:text-lg font-black text-[#a11635]">{investorData.fixedIncome}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">Fixed Beverage</span>
              </div>
            </div>
          </div>

          {/* Model Portfolio Donut */}
          <div className="w-full">
            <h3 className="text-base font-bold text-[#a11635]">Assigned Treat Allocation</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-2">Portfolio balance configured according to your risk analysis:</p>
            <div className="w-full">
              <PortfolioDonut tier={investorData.tier} />
            </div>
          </div>
        </div>

        {/* Growth Simulator */}
        <div className="w-full">
          <GrowthSimulator />
        </div>

        {/* Treat Points Rewards Component */}
        <div className="w-full">
          <TreatLoggerRewards
            currentPoints={user?.treat_points ?? user?.points ?? 0}
            userId={user?.id || user?.sub}
            userName={user?.name}
            onUpdatePoints={(newPts) => {
              setUser((prev: any) => ({
                ...prev,
                treat_points: newPts,
                points: newPts,
              }));
            }}
          />
        </div>

        {/* Community Feed */}
        {showFeed && (
          <div className="no-print w-full">
            <CommunityFeed />
          </div>
        )}
      </main>

      {/* Modal: Edit Profile */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-[#f9d7df] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-[#a11635] mb-1">Edit Profile</h3>
            <p className="text-xs text-gray-500 mb-4">Update your avatar, user details, and security credentials</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-2">Select Default Character</label>
                <div className="grid grid-cols-4 gap-2">
                  {SANRIO_AVATARS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setEditAvatarEmoji(item.emoji);
                        setEditAvatarImage('');
                      }}
                      className={`p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        !editAvatarImage && editAvatarEmoji === item.emoji
                          ? 'border-[#a11635] bg-[#fff0f3] ring-2 ring-[#a11635]'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 truncate max-w-full">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Or Upload Custom Picture</label>
                <div className="flex items-center gap-3">
                  {editAvatarImage && (
                    <img src={editAvatarImage} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-[#f5b8c6]" />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#fee9ee] file:text-[#a11635] hover:file:bg-[#fedde5] cursor-pointer max-w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-[#fff9fa] rounded-2xl border border-[#fcd5de] space-y-2">
                <span className="block text-[11px] font-bold text-[#a11635]">Change Passcode</span>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Current (Old) Passcode</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Required to set new passcode"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">New Passcode</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New passcode (leave blank to keep current)"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none bg-white"
                  />
                </div>
              </div>

              {editError && <p className="text-xs font-bold text-rose-600 text-center">{editError}</p>}
              {editMsg && <p className="text-xs font-bold text-emerald-600 text-center">{editMsg}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Retake Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-[#f9d7df] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a11635] bg-[#fff0f3] px-2.5 py-1 rounded-md">
                Evaluation Step {currentStep + 1} of {DETAILED_QUIZ.length}
              </span>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-black text-gray-900 mb-4 leading-snug">
              {DETAILED_QUIZ[currentStep].question}
            </h3>

            <div className="space-y-2.5">
              {DETAILED_QUIZ[currentStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerQuestion(opt.points)}
                  className="w-full text-left p-3 sm:p-3.5 rounded-2xl border border-[#fcd5de] bg-[#fff5f7] hover:bg-[#ffeef2] hover:border-[#a11635] transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#a11635]">
                    {opt.text}
                  </span>
                  <span className="text-xs text-[#a11635] font-extrabold opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Admin Console */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full border border-[#f9d7df] shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#a11635] flex items-center gap-2">
                  <span>⚙️</span> System Admin Console
                </h3>
                <p className="text-xs text-gray-500">
                  Total Registered Accounts: <strong className="text-gray-800">{adminUsers.length}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-sm font-bold text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-3 flex gap-2">
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Filter by name, email, or enter ID..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#edd1d8] focus:ring-1 focus:ring-[#a11635] outline-none bg-[#fffcfd]"
              />
              {adminSearch && !isNaN(Number(adminSearch)) && (
                <button
                  onClick={() => handleInspectUser(Number(adminSearch))}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition cursor-pointer"
                >
                  Fetch ID #{adminSearch}
                </button>
              )}
              <button
                onClick={loadAdminUsers}
                disabled={adminLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#fee9ee] text-[#a11635] hover:bg-[#fddbe3] transition disabled:opacity-50 cursor-pointer"
              >
                {adminLoading ? 'Loading...' : 'Refresh All'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {adminLoading ? (
                <p className="text-xs text-center text-gray-400 py-8">
                  Connecting to Postgres database & fetching users...
                </p>
              ) : adminUsers.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-8">
                  No accounts found. Click "Refresh All" to retrieve accounts.
                </p>
              ) : (
                adminUsers
                  .filter((u) => {
                    const q = adminSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      u.name?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.id?.toString() === q
                    );
                  })
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-[#fffbfc] hover:border-[#fcd5de] gap-3 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            #{u.id}
                          </span>
                          <span className="font-bold text-xs text-gray-800">
                            {u.name}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-[#ffeef2] text-[#a11635] border border-[#f9d7df]'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span className="text-xs font-bold text-[#a11635] bg-[#ffeef2] px-2.5 py-0.5 rounded-full border border-[#fcd5de]">
                            {u.treat_points ?? u.treatPoints ?? u.points ?? 0} pts
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {u.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto flex-wrap">
                        <button
                          onClick={() => handleInspectUser(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                            u.role === 'admin'
                              ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          Change to {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleResetPoints(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                          title="Set treat points value"
                        >
                          Reset Pts
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {selectedUser && (
              <div className="mt-3 p-3.5 bg-[#fff5f7] border border-[#fcd5de] rounded-2xl flex justify-between items-center animate-fade-in">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a11635] block">
                    Target User Detail (Fetched from DB)
                  </span>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    ID #{selectedUser.id} — {selectedUser.name} ({selectedUser.email})
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Role: <strong className="text-gray-900">{selectedUser.role.toUpperCase()}</strong> | Points:{' '}
                    <strong className="text-[#a11635]">{selectedUser.treat_points ?? selectedUser.points ?? 0}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 px-2 py-1 bg-white border border-[#edd1d8] rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="pt-3 flex justify-end border-t border-gray-100">
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#a11635] text-white hover:bg-[#850f29] transition shadow-xs cursor-pointer"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}