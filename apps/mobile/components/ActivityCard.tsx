// ActivityCard Component
// Compact card for activity-type community posts (challenge completed, badge earned, level up, streak)
// Tap to expand/collapse user content text

import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, spacing } from '@/constants/theme';
import type { CommunityPost } from '@solvterra/shared';

interface ActivityCardProps {
  post: CommunityPost;
  currentUserId?: string;
  onLike: (postId: string) => void;
}

// Activity text by post type (German)
const ACTIVITY_TEXT: Record<string, (name: string) => string> = {
  challenge_completed: (name) => `${name} hat eine Challenge abgeschlossen`,
  badge_earned: (name) => `${name} hat ein Abzeichen verdient`,
  level_up: (name) => `${name} hat ein neues Level erreicht`,
  streak_achieved: (name) => `${name} hat eine Serie erreicht`,
};

// Icon by post type
const ACTIVITY_ICON: Record<string, { name: string; color: string }> = {
  challenge_completed: { name: 'check-circle', color: Colors.primary[600] },
  badge_earned: { name: 'medal', color: '#f59e0b' },
  level_up: { name: 'arrow-up-circle', color: '#8b5cf6' },
  streak_achieved: { name: 'fire', color: '#ef4444' },
};

// Format relative time
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `vor ${diffHours} Std`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `vor ${diffWeeks} ${diffWeeks === 1 ? 'Woche' : 'Wochen'}`;
};

export default function ActivityCard({ post, currentUserId, onLike }: ActivityCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isOwnPost = !!currentUserId && post.authorId === currentUserId;

  const handleAvatarPress = useCallback(() => {
    if (isOwnPost) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/user/${post.authorId}`);
    }
  }, [isOwnPost, post.authorId, router]);

  const activityText = ACTIVITY_TEXT[post.type]?.(post.authorName) ?? post.authorName;
  const icon = ACTIVITY_ICON[post.type] ?? { name: 'information', color: Colors.textMuted };
  const hasContent = !!post.content?.trim();

  return (
    <Pressable
      style={styles.card}
      onPress={hasContent ? () => setExpanded(!expanded) : undefined}
    >
      <View style={styles.row}>
        {/* Small avatar */}
        <Pressable onPress={(e) => { e.stopPropagation(); handleAvatarPress(); }}>
          <Image
            source={{
              uri:
                post.authorAvatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}`,
            }}
            style={styles.avatar}
          />
        </Pressable>

        {/* Activity icon + text */}
        <View style={styles.content}>
          <View style={styles.textRow}>
            <MaterialCommunityIcons
              name={icon.name as any}
              size={16}
              color={icon.color}
              style={styles.activityIcon}
            />
            <Text style={styles.activityText} numberOfLines={expanded ? undefined : 1}>
              {activityText}
            </Text>
          </View>

          {/* User content text (collapsed: 1 line, expanded: full) */}
          {hasContent && (
            <Text
              style={styles.contentText}
              numberOfLines={expanded ? undefined : 1}
            >
              {post.content}
            </Text>
          )}

          {/* XP earned + timestamp */}
          <View style={styles.metaRow}>
            {post.xpEarned ? (
              <View style={styles.xpTag}>
                <MaterialCommunityIcons name="lightning-bolt" size={12} color="#f59e0b" />
                <Text style={styles.xpText}>+{post.xpEarned} XP</Text>
              </View>
            ) : null}
            <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </View>

        {/* Like button */}
        <Pressable
          style={styles.likeButton}
          onPress={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
        >
          <MaterialCommunityIcons
            name={post.userHasLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.userHasLiked ? '#ef4444' : Colors.textMuted}
          />
          {post.likesCount > 0 && (
            <Text
              style={[
                styles.likeCount,
                post.userHasLiked && styles.likeCountActive,
              ]}
            >
              {post.likesCount}
            </Text>
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[100],
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    marginRight: 4,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  contentText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 8,
  },
  xpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 4,
    marginTop: 2,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  likeCountActive: {
    color: '#ef4444',
  },
});
