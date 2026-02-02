import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async () => {
    set({ isLoading: true });

    try {
      // Load latest 20 notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to load notifications:', error);
        return;
      }

      const notifications = data || [];
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    const { notifications } = get();

    // Optimistic update
    set({
      notifications: notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      get().loadNotifications();
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();

    // Optimistic update
    set({
      notifications: notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    });

    try {
      await supabase.rpc('mark_all_notifications_read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on error
      get().loadNotifications();
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();

    // Add new notification at the beginning, keep max 20
    const updated = [notification, ...notifications].slice(0, 20);
    const unreadCount = updated.filter((n) => !n.is_read).length;

    set({ notifications: updated, unreadCount });
  },
}));
