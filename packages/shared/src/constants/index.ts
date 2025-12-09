// SolvTerra Shared Constants
// Design tokens, categories, and configuration

import type { ChallengeCategory, ChallengeDuration, UserLevel, Badge, ChallengeTemplate } from '../types';
export { XP_BY_DURATION } from '../types';

// ============================================
// DESIGN TOKENS - COLORS
// SolvTerra Brand: Forest Green + Warm Cream
// ============================================

export const Colors = {
  // Primary Brand Colors - Forest Green
  // Main: #2e6417
  primary: {
    50: '#f4f7f2',
    100: '#e6efe2',
    200: '#ccdfc6',
    300: '#a8c89d',
    400: '#7daa6d',
    500: '#548847',
    600: '#2e6417', // Main primary - SolvTerra brand
    700: '#275414',
    800: '#214511',
    900: '#1b380e',
  },

  // Secondary - Teal (Impact, Growth, Success states)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main secondary
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Accent - Warm Amber/Gold (Achievements, Rewards, Gamification)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Neutral - Warm Gray (complements cream background)
  neutral: {
    50: '#fafaf8',   // Light background
    100: '#f5f4f0',
    200: '#e8e6e0',
    300: '#d6d3cb',
    400: '#a8a49a',
    500: '#78756c',  // Muted text
    600: '#5c5950',
    700: '#47453e',
    800: '#2d2c28',
    900: '#1a1918',  // Primary text
  },

  // Semantic Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',

  // Surface Colors
  background: '#ffffff',        // Primary background - clean white
  backgroundAlt: '#eeebe3',     // Alternative background - warm cream
  surface: '#ffffff',           // Card/component surface
  surfaceElevated: '#ffffff',   // Elevated surfaces

  // Text Colors
  textPrimary: '#1a1918',       // Warm black
  textSecondary: '#5c5950',     // Muted
  textMuted: '#a8a49a',         // Very muted
  textInverse: '#ffffff',       // On dark backgrounds
} as const;

// ============================================
// CATEGORY CONFIGURATION
// ============================================

export interface CategoryConfig {
  id: ChallengeCategory;
  label: string;
  labelDe: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'environment',
    label: 'Environment',
    labelDe: 'Umwelt',
    icon: 'leaf',
    color: '#2e6417',  // SolvTerra primary - nature/environment
    bgColor: '#e6efe2',
  },
  {
    id: 'social',
    label: 'Social',
    labelDe: 'Soziales',
    icon: 'heart',
    color: '#db2777',  // Pink - warmth, care
    bgColor: '#fce7f3',
  },
  {
    id: 'education',
    label: 'Education',
    labelDe: 'Bildung',
    icon: 'book-open',
    color: '#7c3aed',  // Purple - knowledge, wisdom
    bgColor: '#ede9fe',
  },
  {
    id: 'health',
    label: 'Health',
    labelDe: 'Gesundheit',
    icon: 'activity',
    color: '#dc2626',  // Red - health, urgency
    bgColor: '#fee2e2',
  },
  {
    id: 'animals',
    label: 'Animals',
    labelDe: 'Tiere',
    icon: 'github', // placeholder, use paw icon
    color: '#ea580c',  // Orange - warmth, animals
    bgColor: '#ffedd5',
  },
  {
    id: 'culture',
    label: 'Culture',
    labelDe: 'Kultur',
    icon: 'music',
    color: '#0891b2',  // Cyan - creativity, culture
    bgColor: '#cffafe',
  },
  {
    id: 'other',
    label: 'Other',
    labelDe: 'Sonstiges',
    icon: 'more-horizontal',
    color: '#78756c',  // Neutral - matches new palette
    bgColor: '#f5f4f0',
  },
];

export const getCategoryById = (id: ChallengeCategory): CategoryConfig | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// ============================================
// DURATION OPTIONS
// ============================================

export interface DurationOption {
  value: ChallengeDuration;
  label: string;
  labelDe: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { value: 5, label: '5 min', labelDe: '5 Min.' },
  { value: 10, label: '10 min', labelDe: '10 Min.' },
  { value: 15, label: '15 min', labelDe: '15 Min.' },
  { value: 30, label: '30 min', labelDe: '30 Min.' },
];

// ============================================
// LEVEL CONFIGURATION
// ============================================

export interface LevelConfig {
  level: UserLevel;
  name: string;
  nameDe: string;
  minXp: number;
  maxXp: number;
  icon: string;
  color: string;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 'starter',
    name: 'Starter',
    nameDe: 'Einsteiger',
    minXp: 0,
    maxXp: 99,
    icon: 'star',
    color: '#a8a49a',  // Neutral - just starting
  },
  {
    level: 'helper',
    name: 'Helper',
    nameDe: 'Helfer',
    minXp: 100,
    maxXp: 499,
    icon: 'star',
    color: '#2e6417',  // Primary green - engaged
  },
  {
    level: 'supporter',
    name: 'Supporter',
    nameDe: 'Unterstützer',
    minXp: 500,
    maxXp: 1999,
    icon: 'award',
    color: '#14b8a6',  // Teal - growing impact
  },
  {
    level: 'champion',
    name: 'Champion',
    nameDe: 'Champion',
    minXp: 2000,
    maxXp: 4999,
    icon: 'award',
    color: '#7c3aed',  // Purple - achievement
  },
  {
    level: 'legend',
    name: 'Legend',
    nameDe: 'Legende',
    minXp: 5000,
    maxXp: Infinity,
    icon: 'crown',
    color: '#f59e0b',  // Gold - legendary
  },
];

export const getLevelByXp = (xp: number): LevelConfig => {
  return LEVELS.find((l) => xp >= l.minXp && xp <= l.maxXp) || LEVELS[0];
};

export const getLevelProgress = (xp: number): number => {
  const currentLevel = getLevelByXp(xp);
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;

  if (nextLevelIndex >= LEVELS.length) return 100;

  const nextLevel = LEVELS[nextLevelIndex];
  const xpInLevel = xp - currentLevel.minXp;
  const xpNeeded = nextLevel.minXp - currentLevel.minXp;

  return Math.round((xpInLevel / xpNeeded) * 100);
};

// ============================================
// BADGES CONFIGURATION
// ============================================

export const AVAILABLE_BADGES: Badge[] = [
  // Milestone Badges
  {
    id: 'first-challenge',
    name: 'First Steps',
    description: 'Complete your first challenge',
    iconName: 'rocket',
    category: 'milestone',
    criteria: 'Complete 1 challenge',
    xpBonus: 10,
  },
  {
    id: 'five-challenges',
    name: 'Getting Started',
    description: 'Complete 5 challenges',
    iconName: 'trending-up',
    category: 'milestone',
    criteria: 'Complete 5 challenges',
    xpBonus: 25,
  },
  {
    id: 'ten-challenges',
    name: 'On a Roll',
    description: 'Complete 10 challenges',
    iconName: 'zap',
    category: 'milestone',
    criteria: 'Complete 10 challenges',
    xpBonus: 50,
  },
  {
    id: 'twentyfive-challenges',
    name: 'Dedicated Helper',
    description: 'Complete 25 challenges',
    iconName: 'award',
    category: 'milestone',
    criteria: 'Complete 25 challenges',
    xpBonus: 100,
  },

  // Category Badges
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Complete 5 environment challenges',
    iconName: 'leaf',
    category: 'category',
    criteria: 'Complete 5 environment challenges',
    xpBonus: 30,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Complete 5 social challenges',
    iconName: 'heart',
    category: 'category',
    criteria: 'Complete 5 social challenges',
    xpBonus: 30,
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 5 education challenges',
    iconName: 'book-open',
    category: 'category',
    criteria: 'Complete 5 education challenges',
    xpBonus: 30,
  },
  {
    id: 'health-hero',
    name: 'Health Hero',
    description: 'Complete 5 health challenges',
    iconName: 'activity',
    category: 'category',
    criteria: 'Complete 5 health challenges',
    xpBonus: 30,
  },

  // Special Badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a challenge before 8 AM',
    iconName: 'sunrise',
    category: 'special',
    criteria: 'Complete before 8 AM',
    xpBonus: 15,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a challenge after 10 PM',
    iconName: 'moon',
    category: 'special',
    criteria: 'Complete after 10 PM',
    xpBonus: 15,
  },
  {
    id: 'five-star',
    name: 'Five Star',
    description: 'Receive a 5-star rating from an NGO',
    iconName: 'star',
    category: 'special',
    criteria: 'Get 5-star rating',
    xpBonus: 20,
  },

  // Streak Badges
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    iconName: 'flame',
    category: 'streak',
    criteria: '7-day streak',
    xpBonus: 50,
  },
];

// ============================================
// CHALLENGE TEMPLATES
// ============================================

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'social-media',
    name: 'Social Media Post',
    description: 'Create or share content on social media',
    icon: 'share-2',
    category: 'social',
    type: 'digital',
    suggestedDuration: 10,
    suggestedVerification: 'photo',
    defaultDescription: 'Help us spread the word about our cause on social media!',
    defaultInstructions: '1. Create a post about our campaign\n2. Share it on your preferred social media platform\n3. Take a screenshot of your post\n4. Upload the screenshot as proof',
  },
  {
    id: 'research',
    name: 'Online Research',
    description: 'Research and compile information',
    icon: 'search',
    category: 'education',
    type: 'digital',
    suggestedDuration: 15,
    suggestedVerification: 'text',
    defaultDescription: 'Help us gather important information for our project.',
    defaultInstructions: '1. Research the topic provided\n2. Compile your findings in a short summary\n3. Submit your research as text',
  },
  {
    id: 'flyer-distribution',
    name: 'Flyer Distribution',
    description: 'Distribute flyers in your area',
    icon: 'map-pin',
    category: 'social',
    type: 'onsite',
    suggestedDuration: 30,
    suggestedVerification: 'photo',
    defaultDescription: 'Help us reach more people by distributing flyers in your neighborhood.',
    defaultInstructions: '1. Pick up flyers from the designated location\n2. Distribute them in the specified area\n3. Take a photo of you distributing flyers\n4. Upload as proof',
  },
  {
    id: 'event-photo',
    name: 'Event Documentation',
    description: 'Take photos at an event',
    icon: 'camera',
    category: 'culture',
    type: 'onsite',
    suggestedDuration: 30,
    suggestedVerification: 'photo',
    defaultDescription: 'Document our event with photos!',
    defaultInstructions: '1. Attend the event\n2. Take high-quality photos\n3. Upload your best photos as proof',
  },
  {
    id: 'survey',
    name: 'Survey Distribution',
    description: 'Collect survey responses',
    icon: 'clipboard',
    category: 'education',
    type: 'digital',
    suggestedDuration: 15,
    suggestedVerification: 'text',
    defaultDescription: 'Help us collect valuable feedback through a survey.',
    defaultInstructions: '1. Share the survey link with your network\n2. Collect at least 5 responses\n3. Report the number of responses collected',
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Translate content to another language',
    icon: 'globe',
    category: 'education',
    type: 'digital',
    suggestedDuration: 15,
    suggestedVerification: 'text',
    defaultDescription: 'Help us reach more people by translating our content.',
    defaultInstructions: '1. Review the source text\n2. Translate it to the target language\n3. Submit your translation',
  },
];

// ============================================
// APP CONFIGURATION
// ============================================

export const APP_CONFIG = {
  name: 'SolvTerra',
  tagline: 'Micro-Volunteering für Studierende',
  version: '0.1.0',
  supportEmail: 'support@solvterra.de',
  website: 'https://solvterra.de',

  // Pagination
  pageSize: 20,

  // Validation
  minPasswordLength: 8,
  maxBioLength: 150,
  maxChallengeTitleLength: 80,
  maxChallengeDescriptionLength: 500,
  maxChallengeInstructionsLength: 2000,
  minTextSubmissionLength: 50,
  maxTextSubmissionLength: 5000,
  maxFileSize: 10 * 1024 * 1024, // 10MB

  // Timeouts
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Gamification
  dailyBonusXp: 10,
  streakBonusXp: 50,

  // Social
  maxCancellationsBeforePenalty: 3,
} as const;

// ============================================
// VERIFICATION METHODS
// ============================================

export interface VerificationConfig {
  id: 'photo' | 'text' | 'ngo_confirmation';
  label: string;
  labelDe: string;
  description: string;
  descriptionDe: string;
  icon: string;
}

export const VERIFICATION_METHODS: VerificationConfig[] = [
  {
    id: 'photo',
    label: 'Photo Upload',
    labelDe: 'Foto-Upload',
    description: 'User uploads a photo as proof',
    descriptionDe: 'Nutzer lädt ein Foto als Nachweis hoch',
    icon: 'camera',
  },
  {
    id: 'text',
    label: 'Text Submission',
    labelDe: 'Text-Einreichung',
    description: 'User submits text or a document',
    descriptionDe: 'Nutzer reicht einen Text oder Dokument ein',
    icon: 'file-text',
  },
  {
    id: 'ngo_confirmation',
    label: 'NGO Confirmation',
    labelDe: 'NGO-Bestätigung',
    description: 'NGO manually confirms completion',
    descriptionDe: 'NGO bestätigt die Erledigung manuell',
    icon: 'check-circle',
  },
];
