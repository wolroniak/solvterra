// FriendListItem Component
// Displays a friend in the friends list with unfriend action

import { View, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendListItem as FriendListItemType } from '@solvterra/shared';

interface FriendListItemProps {
  friend: FriendListItemType;
  onUnfriend: (friendshipId: string) => void;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

const getLevelLabel = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.label || level;
};

export default function FriendListItem({
  friend,
  onUnfriend,
}: FriendListItemProps) {
  const { t } = useTranslation('friends');

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
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(friend.level) }]} />
          <Text style={styles.levelText}>{getLevelLabel(friend.level)}</Text>
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
