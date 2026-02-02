// Notifications Screen
// Activity feed showing friend requests, team invites, etc.

import { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useNotificationStore, useFriendStore } from '@/store';
import type { AppNotification } from '@solvterra/shared';

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'friend_request':
      return 'account-plus';
    case 'friend_accepted':
      return 'account-check';
    case 'team_invite':
      return 'account-group';
    case 'team_activated':
      return 'rocket-launch';
    case 'team_bonus':
      return 'star';
    default:
      return 'bell';
  }
};

const getNotificationColor = (type: AppNotification['type']) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accepted':
      return Colors.secondary[500];
    case 'team_invite':
    case 'team_activated':
      return Colors.primary[600];
    case 'team_bonus':
      return '#f59e0b';
    default:
      return Colors.neutral[500];
  }
};

// Group notifications by date
const groupByDate = (notifications: AppNotification[]) => {
  const groups: { title: string; data: AppNotification[] }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayItems: AppNotification[] = [];
  const yesterdayItems: AppNotification[] = [];
  const thisWeekItems: AppNotification[] = [];
  const olderItems: AppNotification[] = [];

  notifications.forEach(n => {
    const date = new Date(n.createdAt);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      todayItems.push(n);
    } else if (date.getTime() === yesterday.getTime()) {
      yesterdayItems.push(n);
    } else if (date > weekAgo) {
      thisWeekItems.push(n);
    } else {
      olderItems.push(n);
    }
  });

  if (todayItems.length > 0) groups.push({ title: 'today', data: todayItems });
  if (yesterdayItems.length > 0) groups.push({ title: 'yesterday', data: yesterdayItems });
  if (thisWeekItems.length > 0) groups.push({ title: 'thisWeek', data: thisWeekItems });
  if (olderItems.length > 0) groups.push({ title: 'older', data: olderItems });

  return groups;
};

export default function NotificationsScreen() {
  const { t } = useTranslation('friends');
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const { acceptRequest, declineRequest } = useFriendStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.challengeId) {
      router.push(`/challenge/${notification.data.challengeId}`);
    } else if (notification.type === 'friend_request' || notification.type === 'friend_accepted') {
      router.push('/friends');
    }
  };

  const handleAcceptFriendRequest = async (notification: AppNotification) => {
    if (notification.data?.friendshipId) {
      await acceptRequest(notification.data.friendshipId);
      markAsRead(notification.id);
      fetchNotifications();
    }
  };

  const handleDeclineFriendRequest = async (notification: AppNotification) => {
    if (notification.data?.friendshipId) {
      await declineRequest(notification.data.friendshipId);
      markAsRead(notification.id);
      fetchNotifications();
    }
  };

  const groups = groupByDate(notifications);

  const renderNotification = (notification: AppNotification) => (
    <Pressable
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.read && styles.notificationUnread,
      ]}
      onPress={() => handlePress(notification)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
        <MaterialCommunityIcons
          name={getNotificationIcon(notification.type)}
          size={22}
          color={getNotificationColor(notification.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        {notification.body && (
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
        )}

        {/* Action buttons for friend requests */}
        {notification.type === 'friend_request' && !notification.read && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleAcceptFriendRequest(notification)}
              compact
              style={styles.acceptBtn}
            >
              {t('actions.accept')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeclineFriendRequest(notification)}
              compact
              style={styles.declineBtn}
            >
              {t('actions.decline')}
            </Button>
          </View>
        )}
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bell-outline" size={64} color={Colors.neutral[300]} />
      <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {notifications.length === 0 && !isLoading ? (
        renderEmpty()
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(group) => group.title}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>
                {t(`notifications.${group.title}`)}
              </Text>
              {group.data.map(renderNotification)}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary[600]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markAllButton: {
    padding: 4,
  },
  markAllText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  group: {
    paddingTop: 16,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  notificationUnread: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: Colors.primary[600],
  },
  declineBtn: {
    borderColor: Colors.neutral[300],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
  },
});
