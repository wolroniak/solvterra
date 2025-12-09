// User State Store
// Manages user authentication and profile state

import { create } from 'zustand';
import type { User, UserBadge, ChallengeCategory, UserStats } from '@solvterra/shared';
import { MOCK_USER, MOCK_NEW_USER, MOCK_USER_STATS, AVAILABLE_BADGES } from '@solvterra/shared';

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Stats
  stats: UserStats | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => void;

  // Onboarding
  setName: (name: string) => void;
  setInterests: (interests: ChallengeCategory[]) => void;
  completeOnboarding: () => void;

  // Profile
  updateProfile: (updates: Partial<User>) => void;

  // Gamification
  addXp: (amount: number) => void;
  earnBadge: (badgeId: string) => UserBadge | null;

  // Saved challenges
  saveChallenge: (challengeId: string) => void;
  unsaveChallenge: (challengeId: string) => void;
  isSaved: (challengeId: string) => boolean;

  // Demo helpers
  resetToNewUser: () => void;
  resetToExistingUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  stats: null,

  // Login actions (mocked)
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { ...MOCK_USER, email },
      isAuthenticated: true,
      isLoading: false,
      stats: MOCK_USER_STATS,
    });
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { ...MOCK_NEW_USER, email: 'user@gmail.com' },
      isAuthenticated: true,
      isLoading: false,
      stats: null,
    });
  },

  loginWithApple: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { ...MOCK_NEW_USER, email: 'user@icloud.com' },
      isAuthenticated: true,
      isLoading: false,
      stats: null,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      stats: null,
    });
  },

  // Onboarding
  setName: (name: string) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, name } });
    }
  },

  setInterests: (interests: ChallengeCategory[]) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, interests } });
    }
  },

  completeOnboarding: () => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, onboardingCompleted: true } });
    }
  },

  // Profile
  updateProfile: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  // Gamification
  addXp: (amount: number) => {
    const { user, stats } = get();
    if (user) {
      const newXp = user.xpTotal + amount;
      // Determine new level
      let newLevel = user.level;
      if (newXp >= 5000) newLevel = 'legend';
      else if (newXp >= 2000) newLevel = 'champion';
      else if (newXp >= 500) newLevel = 'supporter';
      else if (newXp >= 100) newLevel = 'helper';
      else newLevel = 'starter';

      set({
        user: { ...user, xpTotal: newXp, level: newLevel },
        stats: stats ? { ...stats, totalXp: newXp, level: newLevel } : null,
      });
    }
  },

  earnBadge: (badgeId: string) => {
    const { user } = get();
    if (!user) return null;

    // Check if already earned
    if (user.badges.some((b) => b.badge.id === badgeId)) return null;

    const badge = AVAILABLE_BADGES.find((b) => b.id === badgeId);
    if (!badge) return null;

    const userBadge: UserBadge = {
      badge,
      earnedAt: new Date(),
    };

    set({
      user: {
        ...user,
        badges: [...user.badges, userBadge],
      },
    });

    // Add badge XP bonus
    if (badge.xpBonus) {
      get().addXp(badge.xpBonus);
    }

    return userBadge;
  },

  // Saved challenges
  saveChallenge: (challengeId: string) => {
    const { user } = get();
    if (user && !user.savedChallengeIds.includes(challengeId)) {
      set({
        user: {
          ...user,
          savedChallengeIds: [...user.savedChallengeIds, challengeId],
        },
      });
    }
  },

  unsaveChallenge: (challengeId: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          savedChallengeIds: user.savedChallengeIds.filter((id) => id !== challengeId),
        },
      });
    }
  },

  isSaved: (challengeId: string) => {
    const { user } = get();
    return user?.savedChallengeIds.includes(challengeId) ?? false;
  },

  // Demo helpers
  resetToNewUser: () => {
    set({
      user: { ...MOCK_NEW_USER },
      isAuthenticated: true,
      stats: null,
    });
  },

  resetToExistingUser: () => {
    set({
      user: { ...MOCK_USER },
      isAuthenticated: true,
      stats: { ...MOCK_USER_STATS },
    });
  },
}));
