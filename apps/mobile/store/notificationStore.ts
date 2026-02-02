// Notification State Store
// Manages in-app notifications

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AppNotification } from '@solvterra/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => () => void;
}

let subscription: RealtimeChannel | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications: AppNotification[] = (data || []).map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: n.read,
        createdAt: new Date(n.created_at),
      }));

      const unreadCount = notifications.filter(n => !n.read).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await supabase
        .from('app_notifications')
        .update({ read: true })
        .eq('id', id);

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  subscribeToNotifications: () => {
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (subscription) {
        subscription.unsubscribe();
      }

      subscription = supabase
        .channel('app_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'app_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as Record<string, unknown>;
            const notification: AppNotification = {
              id: n.id as string,
              userId: n.user_id as string,
              type: n.type as AppNotification['type'],
              title: n.title as string,
              body: n.body as string | undefined,
              data: n.data as AppNotification['data'],
              read: n.read as boolean,
              createdAt: new Date(n.created_at as string),
            };

            set(state => ({
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  },
}));
