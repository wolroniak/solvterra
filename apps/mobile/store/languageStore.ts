// Language State Store
// Manages language preference with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { getDetectedLanguage } from '../i18n';

export type Language = 'de' | 'en';

interface LanguageState {
  // Current language
  language: Language;
  // Flag to track if user has explicitly chosen a language
  _hasUserSetLanguage: boolean;

  // Actions
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // Default to device language detection
      language: getDetectedLanguage(),
      _hasUserSetLanguage: false,

      setLanguage: (language: Language) => {
        // Update i18n instance
        i18n.changeLanguage(language);
        // Update store and mark that user has explicitly chosen
        set({ language, _hasUserSetLanguage: true });
      },
    }),
    {
      name: 'solvterra-language',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated, sync language with i18n
        // Only override if user has explicitly set a language
        if (state?._hasUserSetLanguage && state?.language) {
          i18n.changeLanguage(state.language);
        }
        // If no user preference saved, keep using detected device language
      },
    }
  )
);
