// CommunityPostCard Component
// Instagram-style feed card with like, comment, and image display

import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Image, Animated, Dimensions, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, spacing } from '@/constants/theme';
import type { CommunityPost, UserLevel } from '@solvterra/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onEdit?: (post: CommunityPost) => void;
  onDelete?: (post: CommunityPost) => void;
}

// Level ring colors
const LEVEL_RING_COLORS: Record<UserLevel, string> = {
  starter: '#9ca3af',
  helper: '#4ade80',
  supporter: '#3b82f6',
  champion: '#8b5cf6',
  legend: '#f59e0b',
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

export default function CommunityPostCard({ post, currentUserId, onLike, onComment, onEdit, onDelete }: CommunityPostCardProps) {
  const router = useRouter();
  const heartAnimScale = useRef(new Animated.Value(0)).current;
  const heartAnimOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef<number>(0);
  const [textExpanded, setTextExpanded] = useState(false);

  const isOwnPost = !!currentUserId && post.authorId === currentUserId;

  const handleAvatarPress = useCallback(() => {
    if (isOwnPost) {
      router.push('/(tabs)/profile');
    } else if (post.authorType === 'organization' && post.organizationId) {
      router.push(`/organization/${post.organizationId}`);
    } else {
      router.push(`/user/${post.authorId}`);
    }
  }, [isOwnPost, post.authorId, post.authorType, post.organizationId, router]);

  // Double-tap detection for like
  const handleImagePress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.userHasLiked) {
        onLike(post.id);
      }
      triggerHeartAnimation();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [post.id, post.userHasLiked, onLike]);

  const triggerHeartAnimation = useCallback(() => {
    heartAnimScale.setValue(0);
    heartAnimOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartAnimScale, {
        toValue: 1,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimOpacity, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heartAnimScale, heartAnimOpacity]);

  const handleChallengePress = () => {
    if (post.linkedChallengeId) {
      router.push(`/challenge/${post.linkedChallengeId}`);
    }
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Beitrag',
      undefined,
      [
        {
          text: 'Bearbeiten',
          onPress: () => onEdit?.(post),
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Beitrag löschen',
              'Möchtest du diesen Beitrag wirklich löschen?',
              [
                { text: 'Abbrechen', style: 'cancel' },
                {
                  text: 'Löschen',
                  style: 'destructive',
                  onPress: () => onDelete?.(post),
                },
              ]
            );
          },
        },
        { text: 'Abbrechen', style: 'cancel' },
      ]
    );
  };

  const hasImage = !!post.imageUrl;
  const authorLevel = post.authorLevel || 'starter';
  const ringColor = LEVEL_RING_COLORS[authorLevel];
  const isOrgPost = post.authorType === 'organization';

  // Build author sub-label
  const getAuthorSubLabel = (): string | null => {
    if (isOrgPost) return post.title || null;
    if (post.linkedChallenge?.organizationName) {
      return `half ${post.linkedChallenge.organizationName}`;
    }
    return null;
  };

  const authorSubLabel = getAuthorSubLabel();
  const hasChallengeLink = !!post.linkedChallengeId;

  return (
    <View style={styles.card}>
      {/* Header: Avatar + Name + Time + Menu */}
      <View style={styles.header}>
        <Pressable onPress={handleAvatarPress}>
          <View style={[styles.avatarRing, { borderColor: isOrgPost ? Colors.primary[600] : ringColor }]}>
            <Image
              source={{ uri: post.authorAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${post.authorName}` }}
              style={styles.avatar}
            />
          </View>
        </Pressable>
        <View style={styles.headerText}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            {isOrgPost && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.primary[600]} style={{ marginLeft: 4 }} />
            )}
          </View>
          {authorSubLabel && (
            <Text style={styles.authorSubLabel} numberOfLines={1}>
              {authorSubLabel}
            </Text>
          )}
        </View>
        {post.xpEarned ? (
          <View style={styles.xpBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#f59e0b" />
            <Text style={styles.xpBadgeText}>+{post.xpEarned} XP</Text>
          </View>
        ) : null}
        {/* 3-dot menu for own posts */}
        {isOwnPost && (
          <Pressable onPress={handleMenuPress} style={styles.menuButton} hitSlop={8}>
            <MaterialCommunityIcons name="dots-vertical" size={22} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Image (full-width, Instagram-style) */}
      {hasImage && (
        <Pressable onPress={handleImagePress}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
            {/* Double-tap heart animation overlay */}
            <Animated.View
              style={[
                styles.heartOverlay,
                {
                  opacity: heartAnimOpacity,
                  transform: [
                    { scale: heartAnimScale },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <MaterialCommunityIcons name="heart" size={80} color="#fff" />
            </Animated.View>
          </View>
        </Pressable>
      )}

      {/* Action Row: Like (with count) + Comment + Challenge Link */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={() => onLike(post.id)}>
          <MaterialCommunityIcons
            name={post.userHasLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={post.userHasLiked ? '#ef4444' : Colors.textPrimary}
          />
          {post.likesCount > 0 && (
            <Text style={[styles.actionCount, post.userHasLiked && styles.actionCountLiked]}>
              {post.likesCount}
            </Text>
          )}
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => onComment(post.id)}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={24}
            color={Colors.textPrimary}
          />
          {post.commentsCount > 0 && (
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          )}
        </Pressable>
        {/* Challenge link button */}
        <Pressable
          style={styles.actionButton}
          onPress={hasChallengeLink ? handleChallengePress : undefined}
          disabled={!hasChallengeLink}
        >
          <MaterialCommunityIcons
            name="trophy-outline"
            size={24}
            color={hasChallengeLink ? Colors.primary[600] : Colors.neutral[300]}
          />
        </Pressable>
      </View>

      {/* Caption — tap to expand */}
      <View style={styles.captionContainer}>
        {post.content && (
          <Pressable onPress={() => setTextExpanded(!textExpanded)}>
            <Text
              style={styles.captionText}
              numberOfLines={textExpanded ? undefined : 3}
            >
              {post.content}
            </Text>
            {!textExpanded && (
              <Text style={styles.moreText}>mehr</Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Comments Preview */}
      {post.commentsCount > 0 && (
        <Pressable onPress={() => onComment(post.id)}>
          <Text style={styles.viewComments}>
            Alle {post.commentsCount} Kommentare ansehen
          </Text>
        </Pressable>
      )}

      {/* Comment previews */}
      {post.comments && post.comments.length > 0 && (
        <View style={styles.commentPreview}>
          {post.comments.slice(0, 2).map(comment => (
            <View key={comment.id} style={styles.commentPreviewRow}>
              <Pressable onPress={() => {
                if (currentUserId && comment.userId === currentUserId) {
                  router.push('/(tabs)/profile');
                } else {
                  router.push(`/user/${comment.userId}`);
                }
              }}>
                <Image
                  source={{ uri: comment.userAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}` }}
                  style={styles.commentPreviewAvatar}
                />
              </Pressable>
              <Text style={styles.commentText} numberOfLines={2}>
                {comment.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.neutral[100],
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  authorSubLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  menuButton: {
    marginLeft: 8,
    padding: 4,
  },

  // Image
  imageWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 4 / 3,
    backgroundColor: Colors.neutral[100],
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    gap: 4,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionCountLiked: {
    color: '#ef4444',
  },

  // Caption
  captionContainer: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  captionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  moreText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Comments
  viewComments: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  commentPreview: {
    paddingHorizontal: 14,
    paddingTop: 4,
    gap: 6,
  },
  commentPreviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentPreviewAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    marginTop: 1,
  },
  commentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  // Timestamp
  timestamp: {
    fontSize: 11,
    color: Colors.textMuted,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 14,
    textTransform: 'lowercase',
  },
});
