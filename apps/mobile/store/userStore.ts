// User State Store
// Manages user authentication and profile state
// Integrates with Supabase Auth for real authentication

import { create } from 'zustand';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { User, UserBadge, ChallengeCategory, UserStats } from '@solvterra/shared';
import { MOCK_USER, MOCK_NEW_USER, MOCK_USER_STATS, AVAILABLE_BADGES } from '@solvterra/shared';
import { supabase } from '../lib/supabase';

// Required for Google OAuth to work properly
WebBrowser.maybeCompleteAuthSession();

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Stats
  stats: UserStats | null;

  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;

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

// Derive a readable display name from email (e.g. "max.mustermann" → "Max Mustermann")
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'User';
  return local
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

// Ensure a users table entry exists for the authenticated user
async function ensureUserRecord(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<void> {
  const name = (authUser.user_metadata?.full_name as string) ||
               (authUser.user_metadata?.name as string) ||
               (authUser.email ? nameFromEmail(authUser.email) : 'New User');
  const avatarUrl = (authUser.user_metadata?.avatar_url as string) ||
                    (authUser.user_metadata?.picture as string) ||
                    null;

  // Upsert: create if not exists, update name/avatar if changed
  await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      name,
      email: authUser.email || '',
      avatar: avatarUrl,
    }, { onConflict: 'id' });
}

// Create a User object from Supabase auth user
function createUserFromAuth(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  const name = (authUser.user_metadata?.full_name as string) ||
               (authUser.user_metadata?.name as string) ||
               (authUser.email ? nameFromEmail(authUser.email) : 'New User');
  const avatarUrl = (authUser.user_metadata?.avatar_url as string) ||
                    (authUser.user_metadata?.picture as string) ||
                    undefined;

  return {
    id: authUser.id,
    name,
    email: authUser.email || '',
    avatarUrl,
    level: 'starter',
    xpTotal: 0,
    badges: [],
    completedChallenges: 0,
    hoursContributed: 0,
    savedChallengeIds: [],
    interests: [],
    createdAt: new Date(),
    onboardingCompleted: false,
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  stats: null,

  // Check existing session on app start
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await ensureUserRecord(session.user);
        const user = createUserFromAuth(session.user);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      set({ isLoading: false });
    }
  },

  // Email/Password Login
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Anmeldung fehlgeschlagen', error.message);
        set({ isLoading: false });
        return;
      }

      if (data.user) {
        await ensureUserRecord(data.user);
        const user = createUserFromAuth(data.user);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Fehler', 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      set({ isLoading: false });
    }
  },

  // Email/Password Sign Up
  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert('Registrierung fehlgeschlagen', error.message);
        set({ isLoading: false });
        return;
      }

      if (data.user) {
        await ensureUserRecord(data.user);
        const user = createUserFromAuth(data.user);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      Alert.alert('Fehler', 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      set({ isLoading: false });
    }
  },

  // Google OAuth Login
  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'solvterra',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert('Google-Anmeldung fehlgeschlagen', error.message);
        set({ isLoading: false });
        return;
      }

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (result.type === 'success' && result.url) {
          // Extract tokens from the URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              Alert.alert('Sitzungsfehler', sessionError.message);
              set({ isLoading: false });
              return;
            }

            if (sessionData.user) {
              await ensureUserRecord(sessionData.user);
              const user = createUserFromAuth(sessionData.user);
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Google login failed:', error);
      Alert.alert('Fehler', 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      set({ isLoading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  // Demo helpers - keep for quick demo presentations
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
