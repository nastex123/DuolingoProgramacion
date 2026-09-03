import { create } from 'zustand';
import type { UserStreak } from '@koda/types';

interface KodaState {
  totalXp: number;
  level: number;
  streak: UserStreak;
  activeLanguageSlug: string;
  addXp: (amount: number) => void;
  setActiveLanguage: (slug: string) => void;
}

export const useKodaStore = create<KodaState>((set) => ({
  totalXp: 150,
  level: 2,
  streak: {
    current_streak: 5,
    max_streak: 12,
    last_activity_date: new Date().toISOString().split('T')[0],
    freeze_count: 1,
    is_active_today: true,
  },
  activeLanguageSlug: 'python',
  addXp: (amount) =>
    set((state) => {
      const newXp = state.totalXp + amount;
      const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;
      return { totalXp: newXp, level: newLevel };
    }),
  setActiveLanguage: (slug) => set({ activeLanguageSlug: slug }),
}));
