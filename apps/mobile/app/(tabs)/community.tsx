// Community Feed Screen
// Shows NGO promotional posts, success stories, and user achievements
// Distinct from social media: Only verified achievements and NGO content

import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { MOCK_COMMUNITY_POSTS } from '@solvterra/shared';
import type { CommunityPost, ReactionType } from '@solvterra/shared';
import CommunityPostCard from '@/components/CommunityPostCard';

// Filter tabs
type FilterTab = 'all' | 'promotions' | 'stories' | 'activity';

const FILTER_TAB_KEYS: FilterTab[] = ['all', 'promotions', 'stories', 'activity'];
const FILTER_TAB_ICONS: Record<FilterTab, string> = {
  all: 'home',
  promotions: 'bullhorn',
  stories: 'star',
  activity: 'lightning-bolt',
};

export default function CommunityScreen() {
  const { t } = useTranslation('community');
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleReact = useCallback((postId: string, reactionType: ReactionType) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        const currentReaction = post.userReaction;
        const newReactions = { ...post.reactions };

        // Remove current reaction if exists
        if (currentReaction) {
          newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
        }

        // Add new reaction if different from current
        if (currentReaction !== reactionType) {
          newReactions[reactionType] = newReactions[reactionType] + 1;
        }

        const totalReactions = Object.values(newReactions).reduce((a, b) => a + b, 0);

        return {
          ...post,
          reactions: newReactions,
          totalReactions,
          userReaction: currentReaction === reactionType ? undefined : reactionType,
        };
      })
    );

    // Show feedback
    const reactionEmojis: Record<ReactionType, string> = {
      heart: '❤️',
      celebrate: '🎉',
      inspiring: '💪',
      thanks: '🙏',
    };
    setSnackbarMessage(`${reactionEmojis[reactionType]} ${t('reactions.added')}`);
    setSnackbarVisible(true);
  }, [t]);

  const handleComment = useCallback((postId: string) => {
    // In a real app, this would open a comment modal
    setSnackbarMessage(t('comments.comingSoon'));
    setSnackbarVisible(true);
  }, [t]);

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    switch (activeFilter) {
      case 'promotions':
        return post.type === 'ngo_promotion';
      case 'stories':
        return post.type === 'success_story';
      case 'activity':
        return ['challenge_completed', 'badge_earned', 'level_up', 'team_challenge', 'streak_achieved'].includes(post.type);
      default:
        return true;
    }
  });

  // Sort: pinned first, then highlighted, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isHighlighted && !b.isHighlighted) return -1;
    if (!a.isHighlighted && b.isHighlighted) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Get the feed header text based on filter
  const getFeedHeaderText = () => {
    switch (activeFilter) {
      case 'promotions':
        return t('feedHeader.promotions', { count: sortedPosts.length });
      case 'stories':
        return t('feedHeader.stories', { count: sortedPosts.length });
      case 'activity':
        return t('feedHeader.activities', { count: sortedPosts.length });
      default:
        return t('feedHeader.posts', { count: sortedPosts.length });
    }
  };

  // Get empty state text based on filter
  const getEmptyText = () => {
    switch (activeFilter) {
      case 'promotions':
        return t('empty.promotions');
      case 'stories':
        return t('empty.stories');
      case 'activity':
        return t('empty.activity');
      default:
        return t('empty.subtitle');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={Colors.primary[600]}
          />
          <Text variant="headlineSmall" style={styles.title}>
            {t('title')}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {t('subtitle')}
        </Text>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {FILTER_TAB_KEYS.map(tabKey => (
            <Pressable
              key={tabKey}
              style={[
                styles.filterTab,
                activeFilter === tabKey && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tabKey)}
            >
              <MaterialCommunityIcons
                name={FILTER_TAB_ICONS[tabKey] as any}
                size={16}
                color={activeFilter === tabKey ? Colors.primary[600] : Colors.textMuted}
              />
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tabKey && styles.filterTabTextActive,
                ]}
              >
                {t(`filters.${tabKey}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Feed List */}
      <FlatList
        data={sortedPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CommunityPostCard
            post={item}
            onReact={handleReact}
            onComment={handleComment}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={64}
              color={Colors.neutral[300]}
            />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {t('empty.title')}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {getEmptyText()}
            </Text>
          </View>
        }
        ListHeaderComponent={
          sortedPosts.length > 0 ? (
            <View style={styles.feedHeader}>
              <Text style={styles.feedHeaderText}>
                {getFeedHeaderText()}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Info Banner - What makes this different from social media */}
      {activeFilter === 'stories' && (
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={16} color={Colors.primary[600]} />
          <Text style={styles.infoBannerText}>
            {t('infoBanner.storiesVerified')}
          </Text>
        </View>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        <View style={styles.snackbarContent}>
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </View>
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  filterTabActive: {
    backgroundColor: Colors.primary[50],
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: Colors.primary[600],
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  feedHeader: {
    marginBottom: spacing.sm,
  },
  feedHeaderText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    marginTop: spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary[700],
  },
  snackbar: {
    backgroundColor: Colors.primary[600],
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
  },
});
