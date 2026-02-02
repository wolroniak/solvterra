// User State Store
// Manages user authentication and profile state
// Integrates with Supabase Auth for real authentication

import { create } from 'zustand';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { User, UserBadge, ChallengeCategory, UserStats, UserLevel } from '@solvterra/shared';
import { MOCK_USER, MOCK_NEW_USER, MOCK_USER_STATS, AVAILABLE_BADGES, XP_LEVELS } from '@solvterra/shared';
import { supabase } from '../lib/supabase';
import { registerForPushNotifications, unregisterPushToken } from '@/lib/notifications';

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
  refreshStats: () => Promise<void>;
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

// Derive UserLevel from XP amount using XP_LEVELS thresholds
function levelFromXp(xp: number): UserLevel {
  if (xp >= XP_LEVELS.legend) return 'legend';
  if (xp >= XP_LEVELS.champion) return 'champion';
  if (xp >= XP_LEVELS.supporter) return 'supporter';
  if (xp >= XP_LEVELS.helper) return 'helper';
  return 'starter';
}

// User data from database (stats + profile)
interface DbUserData {
  xp: number;
  completedChallenges: number;
  hoursContributed: number;
  avatarUrl: string | null;
  name: string | null;
}

// Ensure a users table entry exists and fetch data from database
async function ensureUserRecordAndFetchData(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<DbUserData> {
  const authName = (authUser.user_metadata?.full_name as string) ||
                   (authUser.user_metadata?.name as string) ||
                   null;
  const authAvatarUrl = (authUser.user_metadata?.avatar_url as string) ||
                        (authUser.user_metadata?.picture as string) ||
                        null;

  // First, check if user exists and get current data
  const { data: existingUser } = await supabase
    .from('users')
    .select('name, avatar, xp, completed_challenges, hours_contributed')
    .eq('id', authUser.id)
    .single();

  if (existingUser) {
    // User exists - only update name/avatar if auth provides new values AND DB has none
    const updates: Record<string, string> = {};
    if (authName && !existingUser.name) {
      updates.name = authName;
    }
    if (authAvatarUrl && !existingUser.avatar) {
      updates.avatar = authAvatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('users')
        .update(updates)
        .eq('id', authUser.id);
    }

    return {
      xp: existingUser.xp ?? 0,
      completedChallenges: existingUser.completed_challenges ?? 0,
      hoursContributed: Number(existingUser.hours_contributed ?? 0),
      avatarUrl: existingUser.avatar || authAvatarUrl,
      name: existingUser.name || authName,
    };
  }

  // User doesn't exist - create new record
  const newName = authName || (authUser.email ? nameFromEmail(authUser.email) : 'New User');
  await supabase
    .from('users')
    .insert({
      id: authUser.id,
      name: newName,
      email: authUser.email || '',
      avatar: authAvatarUrl,
    });

  return {
    xp: 0,
    completedChallenges: 0,
    hoursContributed: 0,
    avatarUrl: authAvatarUrl,
    name: newName,
  };
}

// Create a User object from Supabase auth user with data from database
function createUserFromAuth(
  authUser: { id: string; email?: string },
  dbData: DbUserData = { xp: 0, completedChallenges: 0, hoursContributed: 0, avatarUrl: null, name: null }
): User {
  const name = dbData.name || (authUser.email ? nameFromEmail(authUser.email) : 'New User');

  return {
    id: authUser.id,
    name,
    email: authUser.email || '',
    avatarUrl: dbData.avatarUrl || undefined,
    level: levelFromXp(dbData.xp),
    xpTotal: dbData.xp,
    badges: [],
    completedChallenges: dbData.completedChallenges,
    hoursContributed: dbData.hoursContributed,
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
        const stats = await ensureUserRecordAndFetchData(session.user);
        const user = createUserFromAuth(session.user, stats);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Register for push notifications (fire and forget)
        registerForPushNotifications(session.user.id);
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
        const stats = await ensureUserRecordAndFetchData(data.user);
        const user = createUserFromAuth(data.user, stats);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Register for push notifications (fire and forget)
        registerForPushNotifications(data.user.id);
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
        const stats = await ensureUserRecordAndFetchData(data.user);
        const user = createUserFromAuth(data.user, stats);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Register for push notifications (fire and forget)
        registerForPushNotifications(data.user.id);
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
              const stats = await ensureUserRecordAndFetchData(sessionData.user);
              const user = createUserFromAuth(sessionData.user, stats);
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              // Register for push notifications (fire and forget)
              registerForPushNotifications(sessionData.user.id);
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
    const { user } = get();
    try {
      // Unregister push token before signing out
      if (user) {
        await unregisterPushToken(user.id);
      }
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
      const newLevel = levelFromXp(newXp);

      set({
        user: { ...user, xpTotal: newXp, level: newLevel },
        stats: stats ? { ...stats, totalXp: newXp, level: newLevel } : null,
      });

      // Persist to database (fire-and-forget)
      supabase
        .from('users')
        .update({ xp: newXp })
        .eq('id', user.id)
        .then(() => {});
    }
  },

  // Refresh all stats from database (call after submission approval)
  refreshStats: async () => {
    const { user, stats } = get();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('xp, completed_challenges, hours_contributed')
      .eq('id', user.id)
      .single();

    if (data) {
      const newXp = data.xp ?? 0;
      const newLevel = levelFromXp(newXp);
      const newCompletedChallenges = data.completed_challenges ?? 0;
      const newHoursContributed = Number(data.hours_contributed ?? 0);
      set({
        user: {
          ...user,
          xpTotal: newXp,
          level: newLevel,
          completedChallenges: newCompletedChallenges,
          hoursContributed: newHoursContributed,
        },
        stats: stats ? {
          ...stats,
          totalXp: newXp,
          level: newLevel,
          completedChallenges: newCompletedChallenges,
          hoursContributed: newHoursContributed,
        } : null,
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
