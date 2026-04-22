import { create } from 'zustand';

export const useAppStore = create((set) => ({
  predictions: [],
  addPrediction: (p) => set(s => ({ predictions: [p, ...s.predictions] })),
  theme: 'light',
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  currentCrop: null,
  setCurrentCrop: (crop) => set({ currentCrop: crop })
}));