// Community State Store
// Manages community posts, likes, and comments
// Backed by Supabase for persistence

import { create } from 'zustand';
import { Alert } from 'react-native';
import type { CommunityPost, CommunityComment, UserLevel } from '@solvterra/shared';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

// Page size for infinite scroll
const PAGE_SIZE = 10;

// Helper to get current user info
function getCurrentUser() {
  const state = useUserStore.getState();
  return state.user;
}

// DB row types
interface DbPost {
  id: string;
  user_id: string;
  submission_id: string | null;
  challenge_id: string | null;
  type: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  is_highlighted: boolean;
  organization_id: string | null;
  is_pinned: boolean;
  created_at: string;
  organizations?: {
    id: string;
    name: string;
    logo: string | null;
  };
  users?: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  };
  challenges?: {
    id: string;
    title: string;
    title_en: string | null;
    image_url: string | null;
    xp_reward: number;
    duration_minutes: number;
    category: string;
    organizations?: {
      name: string;
    };
  };
  submissions?: {
    id: string;
    xp_earned: number | null;
    proof_url: string | null;
  };
}

// Resolve comment author info: if user is an NGO admin, use org logo + name
async function resolveCommentAuthors(userIds: string[]): Promise<Record<string, { name: string; avatar: string | null; organizationId?: string }>> {
  if (userIds.length === 0) return {};

  // Fetch user info
  const { data: usersData } = await supabase.from('users').select('id, name, avatar').in('id', userIds);
  const userMap: Record<string, { name: string; avatar: string | null; organizationId?: string }> = {};
  (usersData || []).forEach(u => { userMap[u.id] = { name: u.name, avatar: u.avatar }; });

  // Check which users are NGO admins
  const { data: ngoAdmins } = await supabase
    .from('ngo_admins')
    .select('user_id, organization_id, organizations(name, logo)')
    .in('user_id', userIds);

  // Override with org info for NGO admins
  (ngoAdmins || []).forEach((admin: any) => {
    if (admin.organizations) {
      userMap[admin.user_id] = {
        name: admin.organizations.name,
        avatar: admin.organizations.logo,
        organizationId: admin.organization_id,
      };
    }
  });

  return userMap;
}

// Map DB row to CommunityPost
function mapDbPost(row: DbPost, likesCount: number, userHasLiked: boolean, commentsCount: number): CommunityPost {
  const user = row.users;
  const challenge = row.challenges;
  const submission = row.submissions;
  const org = row.organization_id && row.organizations ? row.organizations : null;

  return {
    id: row.id,
    type: row.type as CommunityPost['type'],
    authorType: org ? 'organization' as const : 'user' as const,
    authorId: row.user_id,
    authorName: org ? org.name : (user?.name || 'Unbekannt'),
    authorAvatarUrl: org ? (org.logo || undefined) : (user?.avatar || undefined),
    authorLevel: 'helper' as UserLevel, // TODO: fetch real level
    organizationId: org ? row.organization_id! : undefined,
    organizationLogoUrl: org ? (org.logo || undefined) : undefined,
    title: row.title || undefined,
    content: row.content || undefined,
    imageUrl: row.image_url || submission?.proof_url || undefined,
    linkedChallengeId: row.challenge_id || undefined,
    linkedChallenge: challenge ? {
      id: challenge.id,
      title: challenge.title,
      title_en: challenge.title_en || undefined,
      imageUrl: challenge.image_url || undefined,
      organizationName: challenge.organizations?.name || '',
      category: challenge.category as CommunityPost['linkedChallenge'] extends { category: infer C } ? C : never,
      xpReward: challenge.xp_reward,
      durationMinutes: challenge.duration_minutes as 5 | 10 | 15 | 30,
    } : undefined,
    submissionId: row.submission_id || undefined,
    xpEarned: submission?.xp_earned || undefined,
    likesCount,
    userHasLiked,
    commentsCount,
    isHighlighted: row.is_highlighted,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  };
}

interface CommunityState {
  // Posts
  posts: CommunityPost[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // Comments for currently viewed post
  comments: CommunityComment[];
  isLoadingComments: boolean;

  // Actions
  loadPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<CommunityComment | null>;
  loadComments: (postId: string) => Promise<void>;
  createPost: (data: {
    type: CommunityPost['type'];
    content?: string;
    imageUrl?: string;
    submissionId?: string;
    challengeId?: string;
  }) => Promise<CommunityPost | null>;
  deletePost: (postId: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  getPostBySubmissionId: (submissionId: string) => Promise<CommunityPost | null>;
  getUserPosts: (userId: string) => Promise<CommunityPost[]>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  page: 0,
  comments: [],
  isLoadingComments: false,

  loadPosts: async () => {
    set({ isLoading: true, page: 0 });

    const userId = getCurrentUser()?.id;

    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('is_highlighted', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (error) {
      console.error('Failed to load community posts:', error);
      set({ isLoading: false });
      return;
    }

    const posts = await enrichPostsWithCounts(data || [], userId);

    set({
      posts,
      isLoading: false,
      hasMore: (data || []).length === PAGE_SIZE,
      page: 1,
    });
  },

  loadMorePosts: async () => {
    const { page, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });

    const userId = getCurrentUser()?.id;
    const offset = page * PAGE_SIZE;

    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('is_highlighted', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('Failed to load more posts:', error);
      set({ isLoading: false });
      return;
    }

    const newPosts = await enrichPostsWithCounts(data || [], userId);

    set({
      posts: [...get().posts, ...newPosts],
      isLoading: false,
      hasMore: (data || []).length === PAGE_SIZE,
      page: page + 1,
    });
  },

  refreshPosts: async () => {
    await get().loadPosts();
  },

  toggleLike: async (postId: string) => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      Alert.alert('Fehler', 'Du musst angemeldet sein.');
      return;
    }

    const { posts } = get();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.userHasLiked;

    // Optimistic update
    set({
      posts: posts.map(p =>
        p.id === postId
          ? {
              ...p,
              userHasLiked: !wasLiked,
              likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      ),
    });

    if (wasLiked) {
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to unlike:', error);
        // Revert optimistic update
        set({
          posts: get().posts.map(p =>
            p.id === postId
              ? { ...p, userHasLiked: true, likesCount: p.likesCount + 1 }
              : p
          ),
        });
      }
    } else {
      const { error } = await supabase
        .from('community_likes')
        .insert({ post_id: postId, user_id: userId });

      if (error) {
        console.error('Failed to like:', error);
        // Revert optimistic update
        set({
          posts: get().posts.map(p =>
            p.id === postId
              ? { ...p, userHasLiked: false, likesCount: p.likesCount - 1 }
              : p
          ),
        });
      }
    }
  },

  loadComments: async (postId: string) => {
    set({ isLoadingComments: true, comments: [] });

    // Fetch comments without FK join (FK points to auth.users, not public.users)
    const { data, error } = await supabase
      .from('community_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load comments:', error);
      set({ isLoadingComments: false });
      return;
    }

    // Resolve user/org info for comment authors
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    const userMap = await resolveCommentAuthors(userIds);

    const comments: CommunityComment[] = (data || []).map(c => ({
      id: c.id,
      postId: c.post_id,
      userId: c.user_id,
      userName: userMap[c.user_id]?.name || 'Unbekannt',
      userAvatarUrl: userMap[c.user_id]?.avatar || undefined,
      organizationId: userMap[c.user_id]?.organizationId,
      content: c.content,
      createdAt: new Date(c.created_at),
    }));

    set({ comments, isLoadingComments: false });
  },

  addComment: async (postId: string, content: string) => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein.');
      return null;
    }

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Fehler', 'Kommentar konnte nicht gesendet werden.');
      return null;
    }

    const newComment: CommunityComment = {
      id: data.id,
      postId: data.post_id,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      content: data.content,
      createdAt: new Date(data.created_at),
    };

    // Add to local comments and update post comment count
    set({
      comments: [...get().comments, newComment],
      posts: get().posts.map(p =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount + 1 }
          : p
      ),
    });

    return newComment;
  },

  createPost: async (postData) => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein.');
      return null;
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        type: postData.type,
        content: postData.content || null,
        image_url: postData.imageUrl || null,
        submission_id: postData.submissionId || null,
        challenge_id: postData.challengeId || null,
      })
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .single();

    if (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Fehler', 'Beitrag konnte nicht erstellt werden.');
      return null;
    }

    const newPost = mapDbPost(data, 0, false, 0);

    // Add to top of feed
    set({ posts: [newPost, ...get().posts] });

    return newPost;
  },

  deletePost: async (postId: string) => {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Failed to delete post:', error);
      Alert.alert('Fehler', 'Beitrag konnte nicht gelöscht werden.');
      return;
    }

    set({ posts: get().posts.filter(p => p.id !== postId) });
  },

  updatePost: async (postId: string, content: string) => {
    const { error } = await supabase
      .from('community_posts')
      .update({ content })
      .eq('id', postId);

    if (error) {
      console.error('Failed to update post:', error);
      Alert.alert('Fehler', 'Beitrag konnte nicht aktualisiert werden.');
      return;
    }

    // Update local state
    set({
      posts: get().posts.map(p =>
        p.id === postId ? { ...p, content } : p
      ),
    });
  },

  getPostBySubmissionId: async (submissionId: string) => {
    const currentUserId = getCurrentUser()?.id;

    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .eq('submission_id', submissionId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const posts = await enrichPostsWithCounts([data], currentUserId);
    return posts[0] || null;
  },

  getUserPosts: async (userId: string) => {
    const currentUserId = getCurrentUser()?.id;

    const { data, error } = await supabase
      .from('community_posts')
      .select('*, users(*), organizations(id, name, logo), challenges(*, organizations(name)), submissions(id, xp_earned, proof_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load user posts:', error);
      return [];
    }

    return enrichPostsWithCounts(data || [], currentUserId);
  },
}));

// Helper: enrich posts with like counts, user-like status, and comment previews
async function enrichPostsWithCounts(rows: DbPost[], userId?: string | null): Promise<CommunityPost[]> {
  if (rows.length === 0) return [];

  const postIds = rows.map(r => r.id);

  // Batch fetch like counts
  const { data: likeCounts } = await supabase
    .from('community_likes')
    .select('post_id')
    .in('post_id', postIds);

  // Batch fetch comment counts
  const { data: commentCounts } = await supabase
    .from('community_comments')
    .select('post_id')
    .in('post_id', postIds);

  // Batch fetch 2 most recent comments per post for inline previews
  // (no FK join — FK points to auth.users, not public.users)
  const { data: recentComments } = await supabase
    .from('community_comments')
    .select('id, post_id, user_id, content, created_at')
    .in('post_id', postIds)
    .order('created_at', { ascending: false });

  // Resolve user/org info for comment authors
  const commentUserIds = [...new Set((recentComments || []).map(c => c.user_id))];
  const commentUserMap = await resolveCommentAuthors(commentUserIds);

  // Batch fetch user's likes
  let userLikes: Set<string> = new Set();
  if (userId) {
    const { data: userLikeData } = await supabase
      .from('community_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
    userLikes = new Set((userLikeData || []).map(l => l.post_id));
  }

  // Count per post
  const likeCountMap: Record<string, number> = {};
  (likeCounts || []).forEach(l => {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
  });

  const commentCountMap: Record<string, number> = {};
  (commentCounts || []).forEach(c => {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
  });

  // Group recent comments by post, keep only 2 newest per post
  const commentPreviewMap: Record<string, CommunityComment[]> = {};
  (recentComments || []).forEach(c => {
    if (!commentPreviewMap[c.post_id]) {
      commentPreviewMap[c.post_id] = [];
    }
    if (commentPreviewMap[c.post_id].length < 2) {
      commentPreviewMap[c.post_id].push({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        userName: commentUserMap[c.user_id]?.name || 'Unbekannt',
        userAvatarUrl: commentUserMap[c.user_id]?.avatar || undefined,
        organizationId: commentUserMap[c.user_id]?.organizationId,
        content: c.content,
        createdAt: new Date(c.created_at),
      });
    }
  });
  // Reverse so oldest of the 2 shows first
  Object.values(commentPreviewMap).forEach(arr => arr.reverse());

  return rows.map(row => {
    const post = mapDbPost(
      row,
      likeCountMap[row.id] || 0,
      userLikes.has(row.id),
      commentCountMap[row.id] || 0,
    );
    post.comments = commentPreviewMap[row.id];
    return post;
  });
}
