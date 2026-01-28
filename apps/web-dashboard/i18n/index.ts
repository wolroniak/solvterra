// i18n Configuration for SolvTerra Web Dashboard
// Mirrors the mobile app's i18next setup

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deCommon from './locales/de/common.json';
import enCommon from './locales/en/common.json';
import deDashboard from './locales/de/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import deAuth from './locales/de/auth.json';
import enAuth from './locales/en/auth.json';
import deChallenges from './locales/de/challenges.json';
import enChallenges from './locales/en/challenges.json';
import deChallengeForm from './locales/de/challengeForm.json';
import enChallengeForm from './locales/en/challengeForm.json';
import deSubmissions from './locales/de/submissions.json';
import enSubmissions from './locales/en/submissions.json';
import deCommunity from './locales/de/community.json';
import enCommunity from './locales/en/community.json';
import deStatistics from './locales/de/statistics.json';
import enStatistics from './locales/en/statistics.json';
import deSettings from './locales/de/settings.json';
import enSettings from './locales/en/settings.json';
import deSupport from './locales/de/support.json';
import enSupport from './locales/en/support.json';
import deAdmin from './locales/de/admin.json';
import enAdmin from './locales/en/admin.json';

const resources = {
  de: {
    common: deCommon,
    dashboard: deDashboard,
    auth: deAuth,
    challenges: deChallenges,
    challengeForm: deChallengeForm,
    submissions: deSubmissions,
    community: deCommunity,
    statistics: deStatistics,
    settings: deSettings,
    support: deSupport,
    admin: deAdmin,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    challenges: enChallenges,
    challengeForm: enChallengeForm,
    submissions: enSubmissions,
    community: enCommunity,
    statistics: enStatistics,
    settings: enSettings,
    support: enSupport,
    admin: enAdmin,
  },
};

// Detect browser language
const browserLang = typeof navigator !== 'undefined'
  ? navigator.language?.split('-')[0]
  : 'de';

const defaultLanguage = browserLang === 'en' ? 'en' : 'de';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'de',
  defaultNS: 'common',
  ns: [
    'common',
    'dashboard',
    'auth',
    'challenges',
    'challengeForm',
    'submissions',
    'community',
    'statistics',
    'settings',
    'support',
    'admin',
  ],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
