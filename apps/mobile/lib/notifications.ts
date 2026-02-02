import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and store the token in Supabase
 * @param userId - The user's ID in the users table
 * @returns The Expo push token or null if registration failed
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    // Store token in Supabase
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        device_type: Platform.OS as 'ios' | 'android',
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,expo_push_token',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error('Failed to store push token:', error);
      return null;
    }

    console.log('Push token registered:', token);
    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Unregister push token (mark as inactive)
 * @param userId - The user's ID in the users table
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    await supabase
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('expo_push_token', token);
  } catch (error) {
    console.error('Failed to unregister push token:', error);
  }
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all delivered notifications
 */
export async function clearNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
