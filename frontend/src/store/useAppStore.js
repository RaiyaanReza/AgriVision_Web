import { create } from 'zustand';

const STORAGE_KEY = 'agrivision-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export const useAppStore = create((set) => ({
  predictions: [],
  addPrediction: (p) => set(s => ({ predictions: [p, ...s.predictions] })),
  theme: getInitialTheme(),
  toggleTheme: () => set(s => {
    const next = s.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    return { theme: next };
  }),
  currentCrop: null,
  setCurrentCrop: (crop) => set({ currentCrop: crop })
}));

applyTheme(getInitialTheme());
