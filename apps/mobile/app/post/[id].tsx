// Post Detail Screen
// Shows a single community post with full interactions

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCommunityStore, useUserStore } from '@/store';
import CommunityPostCard from '@/components/CommunityPostCard';
import CommentSheet from '@/components/CommentSheet';
import CreatePostModal from '@/components/CreatePostModal';
import type { CommunityPost } from '@solvterra/shared';
import { supabase } from '@/lib/supabase';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();
  const { toggleLike, deletePost } = useCommunityStore();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Comment sheet state
  const [showComments, setShowComments] = useState(false);

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
    if (id) loadPost();
  }, [id]);

  const loadPost = async () => {
    if (!id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to load post:', error);
      setIsLoading(false);
      return;
    }

    // Fetch like/comment counts
    const { count: likesCount } = await supabase
      .from('community_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', id);

    const { count: commentsCount } = await supabase
      .from('community_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', id);

    let userHasLiked = false;
    if (user?.id) {
      const { count } = await supabase
        .from('community_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', id)
        .eq('user_id', user.id);
      userHasLiked = (count || 0) > 0;
    }

    // Fetch comment previews (no FK join — FK points to auth.users, not public.users)
    const { data: recentComments } = await supabase
      .from('community_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: false })
      .limit(2);

    // Resolve user/org info for comment authors
    const commentUserIds = Array.from(new Set((recentComments || []).map(c => c.user_id)));
    const commentUserMap: Record<string, { name: string; avatar: string | null; organizationId?: string }> = {};

    if (commentUserIds.length > 0) {
      // Fetch user info
      const { data: usersData } = await supabase.from('users').select('id, name, avatar').in('id', commentUserIds);
      (usersData || []).forEach(u => { commentUserMap[u.id] = { name: u.name, avatar: u.avatar }; });

      // Check which users are NGO admins
      const { data: ngoAdmins } = await supabase
        .from('ngo_admins')
        .select('user_id, organization_id, organizations(name, logo)')
        .in('user_id', commentUserIds);

      // Override with org info for NGO admins
      (ngoAdmins || []).forEach((admin: any) => {
        if (admin.organizations) {
          commentUserMap[admin.user_id] = {
            name: admin.organizations.name,
            avatar: admin.organizations.logo,
            organizationId: admin.organization_id,
          };
        }
      });
    }

    const commentPreviews = (recentComments || []).reverse().map(c => ({
      id: c.id,
      postId: c.post_id,
      userId: c.user_id,
      userName: commentUserMap[c.user_id]?.name || 'Unbekannt',
      userAvatarUrl: commentUserMap[c.user_id]?.avatar || undefined,
      organizationId: commentUserMap[c.user_id]?.organizationId,
      content: c.content,
      createdAt: new Date(c.created_at),
    }));

    const org = data.organization_id && data.organizations ? data.organizations : null;
    const challenge = data.challenges;
    const submission = data.submissions;

    const mappedPost: CommunityPost = {
      id: data.id,
      type: data.type as CommunityPost['type'],
      authorType: org ? 'organization' : 'user',
      authorId: data.user_id,
      authorName: org ? org.name : (data.users?.name || 'Unbekannt'),
      authorAvatarUrl: org ? (org.logo || undefined) : (data.users?.avatar || undefined),
      authorLevel: 'helper',
      organizationId: org ? data.organization_id! : undefined,
      content: data.content || undefined,
      imageUrl: data.image_url || submission?.proof_url || undefined,
      linkedChallengeId: data.challenge_id || undefined,
      linkedChallenge: challenge ? {
        id: challenge.id,
        title: challenge.title,
        imageUrl: challenge.image_url || undefined,
        organizationName: challenge.organizations?.name || '',
        category: challenge.category,
        xpReward: challenge.xp_reward,
        durationMinutes: challenge.duration_minutes,
      } : undefined,
      submissionId: data.submission_id || undefined,
      xpEarned: submission?.xp_earned || undefined,
      likesCount: likesCount || 0,
      userHasLiked,
      commentsCount: commentsCount || 0,
      comments: commentPreviews,
      isHighlighted: data.is_highlighted,
      isPinned: data.is_pinned,
      createdAt: new Date(data.created_at),
    };

    setPost(mappedPost);
    setIsLoading(false);
  };

  const handleLike = useCallback(async (postId: string) => {
    await toggleLike(postId);
    // Update local post state
    setPost(prev => {
      if (!prev) return prev;
      const wasLiked = prev.userHasLiked;
      return {
        ...prev,
        userHasLiked: !wasLiked,
        likesCount: wasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      };
    });
  }, [toggleLike]);

  const handleComment = useCallback(() => {
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    // Refresh post to update comment count
    loadPost();
  }, [id]);

  const handleEdit = useCallback((p: CommunityPost) => {
    setEditPostData({
      id: p.id,
      content: p.content || '',
      challengeTitle: p.linkedChallenge?.title || '',
      imageUrl: p.imageUrl,
      xpEarned: p.xpEarned,
    });
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (p: CommunityPost) => {
    await deletePost(p.id);
  }, [deletePost]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditPostData(undefined);
    loadPost();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="post-outline" size={48} color={Colors.neutral[300]} />
        <Text style={styles.errorText}>Beitrag nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CommunityPostCard
          post={post}
          currentUserId={user?.id}
          onLike={handleLike}
          onComment={handleComment}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </ScrollView>

      <CommentSheet
        visible={showComments}
        postId={post.id}
        onClose={handleCloseComments}
      />

      <CreatePostModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        editPost={editPostData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
