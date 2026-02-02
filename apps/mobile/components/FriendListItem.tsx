// FriendListItem Component
// Displays a friend in the friends list with unfriend action

import { View, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendListItem as FriendListItemType, UserLevel } from '@solvterra/shared';

interface FriendListItemProps {
  friend: FriendListItemType;
  onUnfriend: (friendshipId: string) => void;
  onPress?: (userId: string) => void;
}

// Convert numeric level (1-5) to UserLevel string
const LEVEL_MAP: UserLevel[] = ['starter', 'helper', 'supporter', 'champion', 'legend'];

const getLevelString = (level: number | UserLevel): UserLevel => {
  if (typeof level === 'string') return level;
  return LEVEL_MAP[Math.max(0, Math.min(level - 1, LEVEL_MAP.length - 1))] || 'starter';
};

const getLevelConfig = (level: number | UserLevel) => {
  const levelStr = getLevelString(level);
  return LEVELS.find(l => l.level === levelStr) || LEVELS[0];
};

export default function FriendListItem({
  friend,
  onUnfriend,
  onPress,
}: FriendListItemProps) {
  const { t } = useTranslation('friends');

  const handlePress = () => {
    onPress?.(friend.id);
  };

  const handleLongPress = () => {
    Alert.alert(
      friend.name,
      t('actions.unfriend') + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('actions.unfriend'),
          style: 'destructive',
          onPress: () => onUnfriend(friend.friendshipId),
        },
      ]
    );
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      android_ripple={{ color: Colors.neutral[100] }}
    >
      {friend.avatarUrl ? (
        <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={22} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
        <View style={styles.levelRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelConfig(friend.level).color }]} />
          <Text style={styles.levelText}>{getLevelConfig(friend.level).name}</Text>
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.neutral[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  levelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  levelText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
