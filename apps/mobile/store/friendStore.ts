// Friend State Store
// Manages friendships, requests, and suggestions

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
  FriendListItem,
  FriendRequest,
  FriendSuggestion,
  UserSearchResult
} from '@solvterra/shared';

interface FriendState {
  friends: FriendListItem[];
  pendingRequests: FriendRequest[];
  suggestions: FriendSuggestion[];
  isLoading: boolean;
  error: string | null;

  // Fetch actions
  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;

  // Friend request actions
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  declineRequest: (friendshipId: string) => Promise<boolean>;
  unfriend: (friendshipId: string) => Promise<boolean>;

  // Search
  searchUsers: (query: string) => Promise<UserSearchResult[]>;

  // Counts
  getPendingCount: () => number;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  suggestions: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase.rpc('get_friends', {
        requesting_user_id: user.id,
      });

      if (error) throw error;

      const friends: FriendListItem[] = (data || []).map((f: Record<string, unknown>) => ({
        id: f.id as string,
        name: f.name as string,
        username: f.username as string | undefined,
        avatarUrl: f.avatar_url as string | undefined,
        level: f.level as FriendListItem['level'],
        friendshipId: f.friendship_id as string,
      }));

      set({ friends, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      set({ error: 'Failed to load friends', isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_pending_friend_requests', {
        requesting_user_id: user.id,
      });

      if (error) throw error;

      const requests: FriendRequest[] = (data || []).map((r: Record<string, unknown>) => ({
        friendshipId: r.friendship_id as string,
        user: {
          id: r.user_id as string,
          name: r.name as string,
          username: r.username as string | undefined,
          avatarUrl: r.avatar_url as string | undefined,
          level: r.level as FriendRequest['user']['level'],
        },
        createdAt: new Date(r.created_at as string),
      }));

      set({ pendingRequests: requests });
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  },

  fetchSuggestions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_friend_suggestions', {
        requesting_user_id: user.id,
        limit_count: 5,
      });

      if (error) throw error;

      const suggestions: FriendSuggestion[] = (data || []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        name: s.name as string,
        username: s.username as string | undefined,
        avatarUrl: s.avatar_url as string | undefined,
        level: s.level as FriendSuggestion['level'],
        sharedChallenges: Number(s.shared_challenges),
      }));

      set({ suggestions });
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  },

  sendFriendRequest: async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: userId,
        status: 'pending',
      });

      if (error) throw error;

      get().fetchSuggestions();
      return true;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      return false;
    }
  },

  acceptRequest: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      await Promise.all([
        get().fetchFriends(),
        get().fetchPendingRequests(),
      ]);
      return true;
    } catch (error) {
      console.error('Failed to accept request:', error);
      return false;
    }
  },

  declineRequest: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendshipId);

      if (error) throw error;

      get().fetchPendingRequests();
      return true;
    } catch (error) {
      console.error('Failed to decline request:', error);
      return false;
    }
  },

  unfriend: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      get().fetchFriends();
      return true;
    } catch (error) {
      console.error('Failed to unfriend:', error);
      return false;
    }
  },

  searchUsers: async (query: string) => {
    if (query.length < 2) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('search_users_by_username', {
        search_query: query,
        requesting_user_id: user.id,
        limit_count: 10,
      });

      if (error) throw error;

      return (data || []).map((u: Record<string, unknown>) => ({
        id: u.id as string,
        name: u.name as string,
        username: u.username as string | undefined,
        avatarUrl: u.avatar_url as string | undefined,
        level: u.level as UserSearchResult['level'],
        friendshipStatus: u.friendship_status as UserSearchResult['friendshipStatus'],
      }));
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },

  getPendingCount: () => {
    return get().pendingRequests.length;
  },
}));
