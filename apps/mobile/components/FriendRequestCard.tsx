// FriendRequestCard Component
// Displays a pending friend request with accept/decline buttons

import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendRequest } from '@solvterra/shared';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
  isLoading?: boolean;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

export default function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  isLoading,
}: FriendRequestCardProps) {
  return (
    <View style={styles.container}>
      {request.user.avatarUrl ? (
        <Image source={{ uri: request.user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={24} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{request.user.name}</Text>
        {request.user.username && (
          <Text style={styles.username}>@{request.user.username}</Text>
        )}
        <View style={styles.levelRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(request.user.level) }]} />
          <Text style={styles.levelText}>
            {request.user.level.charAt(0).toUpperCase() + request.user.level.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => onAccept(request.friendshipId)}
          loading={isLoading}
          disabled={isLoading}
          compact
          style={styles.acceptButton}
          labelStyle={styles.buttonLabel}
        >
          <MaterialCommunityIcons name="check" size={18} color="#fff" />
        </Button>
        <Button
          mode="outlined"
          onPress={() => onDecline(request.friendshipId)}
          disabled={isLoading}
          compact
          style={styles.declineButton}
          labelStyle={styles.buttonLabel}
        >
          <MaterialCommunityIcons name="close" size={18} color={Colors.neutral[600]} />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  username: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  levelText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary[600],
    minWidth: 44,
  },
  declineButton: {
    borderColor: Colors.neutral[300],
    minWidth: 44,
  },
  buttonLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
