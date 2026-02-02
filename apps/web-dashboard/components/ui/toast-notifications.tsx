'use client';

import { useEffect, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { create } from 'zustand';
import { X, CheckCircle, Bell, UserPlus, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `notif-${Date.now()}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

const iconByType = {
  success: CheckCircle,
  info: Bell,
  warning: UserPlus,
  error: AlertCircle,
};

const colorByType = {
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export function ToastNotifications() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      {notifications.map((notification) => {
        const Icon = iconByType[notification.type];
        return (
          <Toast.Root
            key={notification.id}
            className={`border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] ${colorByType[notification.type]}`}
            onOpenChange={(open) => {
              if (!open) removeNotification(notification.id);
            }}
          >
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <Toast.Title className="font-semibold text-sm">
                {notification.title}
              </Toast.Title>
              {notification.description && (
                <Toast.Description className="text-sm mt-1 opacity-80">
                  {notification.description}
                </Toast.Description>
              )}
            </div>
            <Toast.Close className="opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </Toast.Close>
          </Toast.Root>
        );
      })}
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-[380px]" />
    </Toast.Provider>
  );
}
