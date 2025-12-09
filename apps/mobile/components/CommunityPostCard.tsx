// CommunityPostCard Component
// Displays community posts with reactions, comments, and challenge linking

import { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, spacing } from '@/constants/theme';
import type { CommunityPost, ReactionType, UserLevel } from '@solvterra/shared';
import { REACTION_CONFIG, LEVELS } from '@solvterra/shared';

interface CommunityPostCardProps {
  post: CommunityPost;
  onReact: (postId: string, reactionType: ReactionType) => void;
  onComment?: (postId: string) => void;
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

// Get post type message
const getPostTypeMessage = (post: CommunityPost): string => {
  switch (post.type) {
    case 'ngo_promotion':
      return 'Challenge-Empfehlung';
    case 'success_story':
      return `hat "${post.linkedChallenge?.title}" abgeschlossen`;
    case 'challenge_completed':
      return `hat "${post.linkedChallenge?.title}" abgeschlossen`;
    case 'badge_earned':
      return `hat das Badge "${post.badgeName}" verdient`;
    case 'level_up':
      return `ist jetzt ${post.newLevel === 'helper' ? 'Helfer' : post.newLevel === 'supporter' ? 'Untersttzer' : post.newLevel === 'champion' ? 'Champion' : 'Legende'}!`;
    case 'team_challenge':
      return `hat mit ${post.teamMemberNames?.join(', ')} eine Team-Challenge gemeistert`;
    case 'streak_achieved':
      return `hat ${post.streakDays} Tage Streak erreicht!`;
    default:
      return '';
  }
};

// Get icon for post type
const getPostTypeIcon = (type: CommunityPost['type']): string => {
  switch (type) {
    case 'ngo_promotion':
      return 'bullhorn';
    case 'success_story':
      return 'star';
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

// Get color for post type
const getPostTypeColor = (type: CommunityPost['type']): string => {
  switch (type) {
    case 'ngo_promotion':
      return Colors.primary[600];
    case 'success_story':
      return Colors.accent[500];
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

export default function CommunityPostCard({ post, onReact, onComment }: CommunityPostCardProps) {
  const router = useRouter();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleReaction = (type: ReactionType) => {
    // Animate
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onReact(post.id, type);
    setShowReactionPicker(false);
  };

  const handleChallengePress = () => {
    if (post.linkedChallengeId) {
      router.push(`/challenge/${post.linkedChallengeId}`);
    }
  };

  const isNgoPost = post.authorType === 'organization';
  const hasContent = post.title || post.content;

  return (
    <Surface style={styles.card} elevation={1}>
      {/* Pinned/Highlighted Badge */}
      {(post.isPinned || post.isHighlighted) && (
        <View style={styles.badgeRow}>
          {post.isPinned && (
            <View style={[styles.badge, styles.pinnedBadge]}>
              <MaterialCommunityIcons name="pin" size={12} color={Colors.primary[600]} />
              <Text style={styles.badgeText}>Angepinnt</Text>
            </View>
          )}
          {post.isHighlighted && (
            <View style={[styles.badge, styles.highlightedBadge]}>
              <MaterialCommunityIcons name="star" size={12} color="#f59e0b" />
              <Text style={[styles.badgeText, { color: '#b45309' }]}>Hervorgehoben</Text>
            </View>
          )}
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: post.authorAvatarUrl }}
          style={[styles.avatar, isNgoPost && styles.avatarOrg]}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            {isNgoPost && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color={Colors.primary[600]} />
              </View>
            )}
            {post.authorLevel && (
              <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(post.authorLevel)}20` }]}>
                <MaterialCommunityIcons
                  name="star"
                  size={10}
                  color={getLevelColor(post.authorLevel)}
                />
              </View>
            )}
          </View>
          <View style={styles.subRow}>
            <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
            {!isNgoPost && (
              <Text style={styles.postTypeText}> {getPostTypeMessage(post)}</Text>
            )}
          </View>
        </View>
        <View style={[styles.typeIcon, { backgroundColor: `${getPostTypeColor(post.type)}15` }]}>
          <MaterialCommunityIcons
            name={getPostTypeIcon(post.type) as any}
            size={20}
            color={getPostTypeColor(post.type)}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        {post.title && (
          <Text style={styles.title}>{post.title}</Text>
        )}

        {/* Text Content */}
        {post.content && (
          <Text style={styles.text} numberOfLines={4}>
            {post.content}
          </Text>
        )}

        {/* Post Image */}
        {post.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
            />
          </View>
        )}

        {/* Linked Challenge Card */}
        {post.linkedChallenge && (
          <Pressable
            style={styles.challengeCard}
            onPress={handleChallengePress}
          >
            {post.linkedChallenge.imageUrl && (
              <Image
                source={{ uri: post.linkedChallenge.imageUrl }}
                style={styles.challengeImage}
              />
            )}
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle} numberOfLines={2}>
                {post.linkedChallenge.title}
              </Text>
              <View style={styles.challengeMeta}>
                <View style={styles.xpBadge}>
                  <MaterialCommunityIcons name="lightning-bolt" size={12} color="#f59e0b" />
                  <Text style={styles.xpText}>{post.linkedChallenge.xpReward} XP</Text>
                </View>
                <Text style={styles.durationText}>
                  {post.linkedChallenge.durationMinutes} Min
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.neutral[400]} />
          </Pressable>
        )}

        {/* Badge Display */}
        {post.type === 'badge_earned' && post.badgeIcon && (
          <View style={styles.badgeContainer}>
            <MaterialCommunityIcons
              name={post.badgeIcon as any}
              size={48}
              color={Colors.accent[500]}
            />
            <Text style={styles.badgeName}>{post.badgeName}</Text>
          </View>
        )}

        {/* Team Members */}
        {post.teamMemberNames && post.teamMemberNames.length > 0 && (
          <View style={styles.teamRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={Colors.secondary[600]} />
            <Text style={styles.teamText}>
              Team: {post.teamMemberNames.join(', ')}
            </Text>
          </View>
        )}

        {/* Streak Badge */}
        {post.type === 'streak_achieved' && post.streakDays && (
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={24} color="#f97316" />
            <Text style={styles.streakText}>{post.streakDays} Tage</Text>
          </View>
        )}

        {/* XP Earned */}
        {post.xpEarned && post.type === 'success_story' && (
          <View style={styles.xpEarnedBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#f59e0b" />
            <Text style={styles.xpEarnedText}>+{post.xpEarned} XP verdient</Text>
          </View>
        )}
      </View>

      {/* Reactions Summary */}
      <View style={styles.reactionsSummary}>
        {post.totalReactions > 0 && (
          <View style={styles.reactionsRow}>
            {Object.entries(post.reactions).map(([type, count]) => {
              if (count === 0) return null;
              const config = REACTION_CONFIG[type as ReactionType];
              return (
                <Text key={type} style={styles.reactionEmoji}>
                  {config.emoji}
                </Text>
              );
            })}
            <Text style={styles.reactionCount}>{post.totalReactions}</Text>
          </View>
        )}
        {post.commentsCount > 0 && (
          <Text style={styles.commentCount}>{post.commentsCount} Kommentare</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Reaction Button with Picker */}
        <View style={styles.reactionWrapper}>
          <Pressable
            style={styles.actionButton}
            onLongPress={() => setShowReactionPicker(true)}
            onPress={() => handleReaction(post.userReaction || 'heart')}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {post.userReaction ? (
                <Text style={styles.activeReaction}>
                  {REACTION_CONFIG[post.userReaction].emoji}
                </Text>
              ) : (
                <MaterialCommunityIcons
                  name="heart-outline"
                  size={22}
                  color={Colors.textMuted}
                />
              )}
            </Animated.View>
            <Text style={[styles.actionText, post.userReaction && styles.actionTextActive]}>
              {post.userReaction ? REACTION_CONFIG[post.userReaction].label : 'Gefällt mir'}
            </Text>
          </Pressable>

          {/* Reaction Picker */}
          {showReactionPicker && (
            <View style={styles.reactionPicker}>
              {Object.entries(REACTION_CONFIG).map(([type, config]) => (
                <Pressable
                  key={type}
                  style={styles.reactionOption}
                  onPress={() => handleReaction(type as ReactionType)}
                >
                  <Text style={styles.reactionOptionEmoji}>{config.emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Comment Button */}
        <Pressable style={styles.actionButton} onPress={() => onComment?.(post.id)}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={20}
            color={Colors.textMuted}
          />
          <Text style={styles.actionText}>Kommentieren</Text>
        </Pressable>

        {/* Challenge Button (for NGO posts) */}
        {isNgoPost && post.linkedChallengeId && (
          <Pressable style={styles.joinButton} onPress={handleChallengePress}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color="#fff"
            />
            <Text style={styles.joinButtonText}>Teilnehmen</Text>
          </Pressable>
        )}
      </View>

      {/* Comments Preview */}
      {post.comments && post.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          {post.comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <Image
                source={{ uri: comment.userAvatarUrl }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentText}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  {' '}{comment.content}
                </Text>
              </View>
            </View>
          ))}
          {post.commentsCount > 2 && (
            <Pressable onPress={() => onComment?.(post.id)}>
              <Text style={styles.moreComments}>
                Alle {post.commentsCount} Kommentare anzeigen
              </Text>
            </Pressable>
          )}
        </View>
      )}
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
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinnedBadge: {
    backgroundColor: Colors.primary[50],
  },
  highlightedBadge: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.primary[700],
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
  avatarOrg: {
    borderRadius: 12,
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
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  levelBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postTypeText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.neutral[100],
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  challengeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
  },
  challengeInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  durationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  badgeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: Colors.accent[50],
    borderRadius: 12,
    marginTop: spacing.sm,
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
  xpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: '#fef3c7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  xpEarnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  reactionsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  commentCount: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    gap: spacing.lg,
  },
  reactionWrapper: {
    position: 'relative',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeReaction: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  actionTextActive: {
    color: Colors.primary[600],
  },
  reactionPicker: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 4,
  },
  reactionOption: {
    padding: 6,
  },
  reactionOptionEmoji: {
    fontSize: 24,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  joinButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  commentsPreview: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 8,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  commentAuthor: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  moreComments: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 4,
  },
});
