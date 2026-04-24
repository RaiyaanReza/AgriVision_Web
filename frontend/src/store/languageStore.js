import { create } from 'zustand';

const useLanguageStore = create((set) => ({
  currentLanguage: 'en',
  setLanguage: (lng) => set({ currentLanguage: lng }),
}));

export default useLanguageStore;
