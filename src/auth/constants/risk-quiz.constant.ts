// src/auth/constants/risk-quiz.constant.ts

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

// 1. PUBLIC: This is what the frontend/user gets to see
// src/auth/constants/risk-quiz.constant.ts

export const RISK_QUESTIONS = [
  {
    id: 'time_horizon',
    title: 'Snack Runway & Empire Urgency',
    prompt: 'How long can you focus before demanding an emergency sweet treat or buying a private island?',
    options: [
      { value: 'short', label: 'Under 10 minutes (Extreme Calorie Deficit Emergency)' },
      { value: 'medium_short', label: 'Right after lunch (Standard Boba Protocol)' },
      { value: 'medium_long', label: 'Late evening dessert raid' },
      { value: 'long', label: 'Diamond-hand fasting until 2 AM instant ramen' },
    ],
  },
  {
    id: 'volatility_reaction',
    title: 'Crisis Management in the Treat Market',
    prompt: 'Your favorite café is completely out of cinnamon rolls and matcha. What is your move?',
    options: [
      { value: 'panic_sell', label: 'Panic starve and drop to the floor dramatically' },
      { value: 'cut_losses', label: 'Settle for plain lukewarm tap water' },
      { value: 'hold', label: 'Wait silently in line hoping a batch appears from thin air' },
      { value: 'buy_dip', label: 'Hostile takeover: Buy out their entire chocolate chip cookie reserves' },
    ],
  },
  {
    id: 'goal',
    title: 'Financial & Metabolic Ambition',
    prompt: 'What is your primary goal for this multi-billion NomNom portfolio?',
    options: [
      { value: 'preserve', label: 'Capital Preservation: Keep emergency cookies strictly untouched' },
      { value: 'balanced', label: 'Balanced Lifestyle: 50% greens, 50% double-cheese pizza' },
      { value: 'growth', label: 'Unchecked Expansion: Acquire 40% of the moon for dairy production' },
    ],
  },
  {
    id: 'experience',
    title: 'Gastronomic Executive Rank',
    prompt: 'What is your verified tier of dessert and empire administration?',
    options: [
      { value: 'beginner', label: 'Beginner: Can barely boil water for tea' },
      { value: 'intermediate', label: 'Intermediate: Professional boba connoisseur' },
      { value: 'expert', label: 'Tycoon: Capable of surviving purely on caffeine and sugar rushes' },
    ],
  },
];

// src/auth/constants/risk-quiz.constant.ts

export const QUIZ_SCORE_MAP: Record<string, Record<string, number>> = {
  time_horizon: {
    short: 5,
    medium_short: 15,
    medium_long: 25,
    long: 35,
  },
  volatility_reaction: {
    panic_sell: 5,
    cut_losses: 10,
    hold: 20,
    buy_dip: 30,
  },
  goal: {
    preserve: 10,
    balanced: 20,
    growth: 30,
  },
  experience: {
    beginner: 5,
    intermediate: 10,
    expert: 15,
  },
};