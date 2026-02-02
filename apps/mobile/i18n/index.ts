// i18n Configuration
// Sets up react-i18next for SolvTerra mobile app

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translation files
import deCommon from './locales/de/common.json';
import deNavigation from './locales/de/navigation.json';
import deAuth from './locales/de/auth.json';
import deChallenges from './locales/de/challenges.json';
import deProfile from './locales/de/profile.json';
import deCommunity from './locales/de/community.json';

import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enChallenges from './locales/en/challenges.json';
import enProfile from './locales/en/profile.json';
import enCommunity from './locales/en/community.json';

// Resources object with namespaces
const resources = {
  de: {
    common: deCommon,
    navigation: deNavigation,
    auth: deAuth,
    challenges: deChallenges,
    profile: deProfile,
    community: deCommunity,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    challenges: enChallenges,
    profile: enProfile,
    community: enCommunity,
  },
};

// Detect if device language is English
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'de';
const defaultLanguage = deviceLanguage === 'en' ? 'en' : 'de';

// Export detected language for use in language store
export const getDetectedLanguage = (): 'de' | 'en' => defaultLanguage;

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'de',
  defaultNS: 'common',
  ns: ['common', 'navigation', 'auth', 'challenges', 'profile', 'community'],
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Disable suspense for better UX
  },
});

export default i18n;
