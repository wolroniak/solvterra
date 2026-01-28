// FeedCard Component
// Displays community activity feed items

import { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import type { FeedItem, UserLevel } from '@solvterra/shared';
import { LEVELS } from '@solvterra/shared';

interface FeedCardProps {
  item: FeedItem;
  onLike: (id: string) => void;
  onCongratulate?: (id: string) => void;
}

// Level badge colors
const getLevelColor = (level: UserLevel) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

// Format time ago
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `vor ${diffMins} Min`;
  }
  if (diffHours < 24) {
    return `vor ${diffHours} Std`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
};

// Get feed item message based on type
const getFeedMessage = (item: FeedItem): string => {
  switch (item.type) {
    case 'challenge_completed':
      return `hat "${item.challengeTitle}" abgeschlossen`;
    case 'badge_earned':
      return `hat das Badge "${item.badgeName}" verdient`;
    case 'level_up':
      return `ist jetzt ${item.newLevel === 'helper' ? 'Helfer' : item.newLevel === 'supporter' ? 'Unterstützer' : item.newLevel === 'champion' ? 'Champion' : 'Legende'}!`;
    case 'team_challenge':
      return `hat mit ${item.teamMemberNames?.join(', ')} "${item.challengeTitle}" gemeistert`;
    case 'streak_achieved':
      return `hat ${item.streakDays} Tage Streak erreicht!`;
    default:
      return 'war aktiv';
  }
};

// Get icon for feed type
const getFeedIcon = (type: FeedItem['type']): string => {
  switch (type) {
    case 'challenge_completed':
      return 'check-circle';
    case 'badge_earned':
      return 'medal';
    case 'level_up':
      return 'arrow-up-circle';
    case 'team_challenge':
      return 'account-group';
    case 'streak_achieved':
      return 'fire';
    default:
      return 'star';
  }
};

// Get color for feed type
const getFeedColor = (type: FeedItem['type']): string => {
  switch (type) {
    case 'challenge_completed':
      return Colors.success;
    case 'badge_earned':
      return Colors.accent[500];
    case 'level_up':
      return '#7c3aed';
    case 'team_challenge':
      return Colors.secondary[500];
    case 'streak_achieved':
      return '#f97316';
    default:
      return Colors.primary[600];
  }
};

export default function FeedCard({ item, onLike, onCongratulate }: FeedCardProps) {
  const [liked, setLiked] = useState(item.isLiked);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    // Animate heart
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLiked(!liked);
    setLikesCount((prev: number) => liked ? prev - 1 : prev + 1);
    onLike(item.id);
  };

  const handleCongratulate = () => {
    onCongratulate?.(item.id);
  };

  return (
    <Surface style={styles.card} elevation={1}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: item.userAvatarUrl }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.userName}</Text>
            {item.userLevel && (
              <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(item.userLevel)}20` }]}>
                <MaterialCommunityIcons
                  name="star"
                  size={10}
                  color={getLevelColor(item.userLevel)}
                />
              </View>
            )}
          </View>
          <Text style={styles.timestamp}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <View style={[styles.typeIcon, { backgroundColor: `${getFeedColor(item.type)}15` }]}>
          <MaterialCommunityIcons
            name={getFeedIcon(item.type) as any}
            size={20}
            color={getFeedColor(item.type)}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message}>
          <Text style={styles.messageHighlight}>{item.userName}</Text>
          {' '}{getFeedMessage(item)}
        </Text>

        {/* Challenge/Badge Image */}
        {(item.challengeImageUrl || item.badgeIcon) && (
          <View style={styles.mediaContainer}>
            {item.challengeImageUrl ? (
              <Image
                source={{ uri: item.challengeImageUrl }}
                style={styles.mediaImage}
              />
            ) : item.badgeIcon && (
              <View style={styles.badgeContainer}>
                <MaterialCommunityIcons
                  name={item.badgeIcon as any}
                  size={48}
                  color={Colors.accent[500]}
                />
                <Text style={styles.badgeName}>{item.badgeName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Team members for team challenges */}
        {item.type === 'team_challenge' && item.teamMemberNames && (
          <View style={styles.teamRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={Colors.secondary[600]} />
            <Text style={styles.teamText}>
              Team: {item.teamMemberNames.join(', ')}
            </Text>
          </View>
        )}

        {/* Streak badge */}
        {item.type === 'streak_achieved' && item.streakDays && (
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={24} color="#f97316" />
            <Text style={styles.streakText}>{item.streakDays} Tage</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <MaterialCommunityIcons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#ef4444' : Colors.textMuted}
            />
          </Animated.View>
          <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
            {likesCount}
          </Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleCongratulate}>
          <MaterialCommunityIcons
            name="party-popper"
            size={20}
            color={Colors.textMuted}
          />
          <Text style={styles.actionText}>Gratulieren</Text>
        </Pressable>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral[100],
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  levelBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  messageHighlight: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mediaContainer: {
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
  },
  badgeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: Colors.accent[50],
    borderRadius: 12,
  },
  badgeName: {
    marginTop: spacing.xs,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[700],
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  teamText: {
    fontSize: 12,
    color: Colors.secondary[700],
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: '#fff7ed',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c2410c',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  actionTextLiked: {
    color: '#ef4444',
  },
});
