// Community Feed Screen
// Instagram-style feed of verified achievements and success stories

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useCommunityStore, useUserStore } from '@/store';
import CommunityPostCard from '@/components/CommunityPostCard';
import ActivityCard from '@/components/ActivityCard';
import CommentSheet from '@/components/CommentSheet';
import CreatePostModal from '@/components/CreatePostModal';
import { supabase } from '@/lib/supabase';
import type { CommunityPost } from '@solvterra/shared';

type FilterType = 'all' | 'stories' | 'activity';

export default function CommunityScreen() {
  const { t } = useTranslation('community');
  const { user } = useUserStore();
  const {
    posts,
    isLoading,
    hasMore,
    loadPosts,
    loadMorePosts,
    refreshPosts,
    toggleLike,
    deletePost,
  } = useCommunityStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [communityXp, setCommunityXp] = useState<number>(0);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostData, setEditPostData] = useState<{
    id: string;
    content: string;
    challengeTitle: string;
    imageUrl?: string;
    xpEarned?: number;
  } | undefined>(undefined);

  useEffect(() => {
    loadPosts();
  }, []);

  // Load community XP when activity tab becomes active
  useEffect(() => {
    if (activeFilter === 'activity') {
      supabase
        .rpc('get_community_total_xp')
        .then(({ data, error }) => {
          if (!error && data !== null) {
            setCommunityXp(data);
          }
        });
    }
  }, [activeFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [hasMore, isLoading, loadMorePosts]);

  const handleLike = useCallback((postId: string) => {
    toggleLike(postId);
  }, [toggleLike]);

  const handleComment = useCallback((postId: string) => {
    setCommentPostId(postId);
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setCommentPostId(null);
  }, []);

  const handleEdit = useCallback((post: CommunityPost) => {
    setEditPostData({
      id: post.id,
      content: post.content || '',
      challengeTitle: post.linkedChallenge?.title || '',
      imageUrl: post.imageUrl,
      xpEarned: post.xpEarned,
    });
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (post: CommunityPost) => {
    await deletePost(post.id);
  }, [deletePost]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditPostData(undefined);
    refreshPosts();
  }, [refreshPosts]);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'stories') return post.type === 'success_story';
    if (activeFilter === 'activity') {
      return ['challenge_completed', 'badge_earned', 'level_up', 'streak_achieved'].includes(post.type);
    }
    return true;
  });

  const isActivityPost = (type: string) =>
    ['challenge_completed', 'badge_earned', 'level_up', 'streak_achieved'].includes(type);

  const renderPost = ({ item }: { item: CommunityPost }) => {
    if (isActivityPost(item.type)) {
      return <ActivityCard post={item} currentUserId={user?.id} onLike={handleLike} />;
    }
    return (
      <CommunityPostCard
        post={item}
        currentUserId={user?.id}
        onLike={handleLike}
        onComment={handleComment}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {([
          { key: 'all', label: t('filters.all') },
          { key: 'stories', label: t('filters.stories') },
          { key: 'activity', label: t('filters.activity') },
        ] as const).map(filter => (
          <View
            key={filter.key}
            style={[
              styles.filterPill,
              activeFilter === filter.key && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === filter.key && styles.filterPillTextActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Community XP Banner - shown only on Activity tab */}
      {activeFilter === 'activity' && (
        <View style={styles.xpBanner}>
          <MaterialCommunityIcons name="star" size={18} color="#f59e0b" />
          <Text style={styles.xpBannerText}>
            Community XP: {communityXp.toLocaleString('de-DE')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="image-filter-none"
          size={64}
          color={Colors.neutral[300]}
        />
        <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
        <Text style={styles.emptySubtitle}>
          {activeFilter === 'stories'
            ? t('empty.stories')
            : activeFilter === 'activity'
              ? t('empty.activity')
              : t('empty.subtitle')}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || posts.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary[600]} />
      </View>
    );
  };

  // Skeleton loading for initial load
  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>Community</Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonNameBlock}>
                  <View style={styles.skeletonName} />
                  <View style={styles.skeletonSub} />
                </View>
              </View>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonActions}>
                <View style={styles.skeletonAction} />
                <View style={styles.skeletonAction} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Community</Text>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[600]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={7}
      />

      {/* Comment Sheet */}
      <CommentSheet
        visible={showComments}
        postId={commentPostId}
        onClose={handleCloseComments}
      />

      {/* Edit Post Modal */}
      <CreatePostModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        editPost={editPostData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Header / Filters
  headerSection: {
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  filterPillActive: {
    backgroundColor: Colors.primary[600],
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },

  // Community XP Banner
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    gap: 6,
  },
  xpBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Skeleton loading
  skeletonContainer: {
    flex: 1,
  },
  skeletonCard: {
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[200],
  },
  skeletonNameBlock: {
    gap: 6,
  },
  skeletonName: {
    width: 120,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[200],
  },
  skeletonSub: {
    width: 80,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral[100],
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: Colors.neutral[200],
  },
  skeletonActions: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },
  skeletonAction: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.neutral[200],
  },
});
