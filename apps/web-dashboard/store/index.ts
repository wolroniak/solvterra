import { create } from 'zustand';
import {
  MOCK_ORGANIZATION,
  MOCK_CHALLENGES,
  MOCK_SUBMISSIONS,
  MOCK_STATS,
  MOCK_COMMUNITY_POSTS,
  MOCK_COMMUNITY_STATS,
  type Organization,
  type Challenge,
  type Submission,
  type DashboardStats,
  type CommunityPost,
  type CommunityStats,
} from '@/lib/mock-data';

// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  organization: Organization | null;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to logged in for demo
  organization: MOCK_ORGANIZATION,
  login: () => set({ isAuthenticated: true, organization: MOCK_ORGANIZATION }),
  logout: () => set({ isAuthenticated: false, organization: null }),
}));

// Challenge Store
interface ChallengeState {
  challenges: Challenge[];
  stats: DashboardStats;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'currentParticipants'>) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  publishChallenge: (id: string) => void;
  pauseChallenge: (id: string) => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: MOCK_CHALLENGES,
  stats: MOCK_STATS,
  addChallenge: (challenge) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: `ch-${Date.now()}`,
      createdAt: new Date(),
      currentParticipants: 0,
    };
    set((state) => ({
      challenges: [...state.challenges, newChallenge],
      stats: {
        ...state.stats,
        totalChallenges: state.stats.totalChallenges + 1,
      },
    }));
  },
  updateChallenge: (id, updates) => {
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
  deleteChallenge: (id) => {
    set((state) => ({
      challenges: state.challenges.filter((c) => c.id !== id),
      stats: {
        ...state.stats,
        totalChallenges: state.stats.totalChallenges - 1,
      },
    }));
  },
  publishChallenge: (id) => {
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === id ? { ...c, status: 'active', publishedAt: new Date() } : c
      ),
      stats: {
        ...state.stats,
        activeChallenges: state.stats.activeChallenges + 1,
      },
    }));
  },
  pauseChallenge: (id) => {
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === id ? { ...c, status: 'paused' } : c
      ),
      stats: {
        ...state.stats,
        activeChallenges: Math.max(0, state.stats.activeChallenges - 1),
      },
    }));
  },
}));

// Submission Store
interface SubmissionState {
  submissions: Submission[];
  pendingCount: number;
  approveSubmission: (id: string, rating: number, feedback?: string) => void;
  rejectSubmission: (id: string, feedback: string) => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: MOCK_SUBMISSIONS,
  pendingCount: MOCK_SUBMISSIONS.filter((s) => s.status === 'submitted').length,
  approveSubmission: (id, rating, feedback) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'approved',
              reviewedAt: new Date(),
              rating,
              feedback,
            }
          : s
      ),
      pendingCount: Math.max(0, state.pendingCount - 1),
    }));
  },
  rejectSubmission: (id, feedback) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'rejected',
              reviewedAt: new Date(),
              feedback,
            }
          : s
      ),
      pendingCount: Math.max(0, state.pendingCount - 1),
    }));
  },
}));

// Community Store
interface CommunityState {
  posts: CommunityPost[];
  stats: CommunityStats;
  addPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'reactions' | 'totalReactions' | 'commentsCount'>) => void;
  updatePost: (id: string, updates: Partial<CommunityPost>) => void;
  deletePost: (id: string) => void;
  publishPost: (id: string) => void;
  unpublishPost: (id: string) => void;
  pinPost: (id: string, isPinned: boolean) => void;
  highlightPost: (id: string, isHighlighted: boolean) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: MOCK_COMMUNITY_POSTS,
  stats: MOCK_COMMUNITY_STATS,
  addPost: (post) => {
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date(),
      reactions: { heart: 0, celebrate: 0, inspiring: 0, thanks: 0 },
      totalReactions: 0,
      commentsCount: 0,
    };
    set((state) => ({
      posts: [newPost, ...state.posts],
      stats: {
        ...state.stats,
        totalPosts: state.stats.totalPosts + 1,
        draftPosts: post.status === 'draft' ? state.stats.draftPosts + 1 : state.stats.draftPosts,
        publishedPosts: post.status === 'published' ? state.stats.publishedPosts + 1 : state.stats.publishedPosts,
      },
    }));
  },
  updatePost: (id, updates) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  deletePost: (id) => {
    set((state) => {
      const post = state.posts.find((p) => p.id === id);
      return {
        posts: state.posts.filter((p) => p.id !== id),
        stats: {
          ...state.stats,
          totalPosts: state.stats.totalPosts - 1,
          draftPosts: post?.status === 'draft' ? state.stats.draftPosts - 1 : state.stats.draftPosts,
          publishedPosts: post?.status === 'published' ? state.stats.publishedPosts - 1 : state.stats.publishedPosts,
        },
      };
    });
  },
  publishPost: (id) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, status: 'published', publishedAt: new Date() } : p
      ),
      stats: {
        ...state.stats,
        publishedPosts: state.stats.publishedPosts + 1,
        draftPosts: Math.max(0, state.stats.draftPosts - 1),
      },
    }));
  },
  unpublishPost: (id) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, status: 'draft' } : p
      ),
      stats: {
        ...state.stats,
        publishedPosts: Math.max(0, state.stats.publishedPosts - 1),
        draftPosts: state.stats.draftPosts + 1,
      },
    }));
  },
  pinPost: (id, isPinned) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, isPinned } : p
      ),
    }));
  },
  highlightPost: (id, isHighlighted) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, isHighlighted } : p
      ),
    }));
  },
}));
