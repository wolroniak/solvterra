import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { Subscription } from 'expo-notifications';

interface NotificationData {
  type?: string;
  challenge_id?: string;
  post_id?: string;
  submission_id?: string;
  [key: string]: unknown;
}

/**
 * Hook to handle notification interactions (when user taps a notification)
 * Routes to appropriate screen based on notification type
 */
export function useNotificationListener() {
  const router = useRouter();
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    // Handle notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification.request.content);
      }
    );

    // Handle notification taps (when user interacts with notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;

        if (!data.type) {
          return;
        }

        switch (data.type) {
          case 'submission_reviewed':
          case 'new_challenge':
            if (data.challenge_id) {
              router.push(`/challenges/${data.challenge_id}`);
            }
            break;

          case 'xp_milestone':
          case 'badge_earned':
            router.push('/profile');
            break;

          case 'community_comment':
          case 'community_like':
            if (data.post_id) {
              router.push(`/community`);
            }
            break;

          default:
            console.log('Unknown notification type:', data.type);
        }
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}

/**
 * Hook to get the last notification that launched the app
 * Useful for handling notifications when app was closed
 */
export function useLastNotificationResponse() {
  const router = useRouter();

  useEffect(() => {
    const checkLastNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response) {
        const data = response.notification.request.content.data as NotificationData;

        if (data.type === 'submission_reviewed' && data.challenge_id) {
          router.push(`/challenges/${data.challenge_id}`);
        }
      }
    };

    checkLastNotification();
  }, [router]);
}
