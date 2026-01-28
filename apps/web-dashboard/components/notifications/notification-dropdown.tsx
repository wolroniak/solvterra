'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'gerade eben';
  if (diffInSeconds < 3600) return `vor ${Math.floor(diffInSeconds / 60)} Min.`;
  if (diffInSeconds < 86400) return `vor ${Math.floor(diffInSeconds / 3600)} Std.`;
  if (diffInSeconds < 604800) return `vor ${Math.floor(diffInSeconds / 86400)} Tagen`;

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function NotificationItem({
  notification,
  onRead,
  onClick,
}: {
  notification: Notification;
  onRead: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0',
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="shrink-0 mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium text-slate-900 line-clamp-1',
              !notification.is_read && 'font-semibold'
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead();
              }}
              className="shrink-0 p-1 hover:bg-slate-100 rounded"
              title="Als gelesen markieren"
            >
              <Check className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  } = useNotificationStore();

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Add new notification in real-time
          addNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Alle gelesen
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                Laden...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Keine Benachrichtigungen</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
