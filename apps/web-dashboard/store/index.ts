import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useNotificationStore } from '@/components/ui/toast-notifications';

function showError(title: string) {
  useNotificationStore.getState().addNotification({
    title,
    type: 'error',
  });
}
import {
  MOCK_COMMUNITY_POSTS,
  MOCK_COMMUNITY_STATS,
  type Organization,
  type Challenge,
  type Submission,
  type DashboardStats,
  type CommunityPost,
  type CommunityStats,
} from '@/lib/mock-data';

// ============================================
// Database Row Types (snake_case from Supabase)
// ============================================

interface DbChallenge {
  id: string;
  organization_id: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  instructions: string | null;
  instructions_en: string | null;
  category: string;
  type: string;
  duration_minutes: number;
  xp_reward: number;
  verification_method: string;
  max_participants: number | null;
  current_participants: number;
  status: string;
  image_url: string | null;
  location_name: string | null;
  location_address: string | null;
  schedule_type: string;
  is_multi_person: boolean;
  min_team_size: number | null;
  max_team_size: number | null;
  published_at: string | null;
  created_at: string;
}

interface DbSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  status: string;
  proof_type: string | null;
  proof_url: string | null;
  proof_text: string | null;
  caption: string | null;
  ngo_rating: number | null;
  ngo_feedback: string | null;
  xp_earned: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  challenges?: DbChallenge;
  users?: { id: string; name: string; avatar: string | null; level: number };
}

// ============================================
// Mappers: DB rows → TypeScript types
// ============================================

function mapDbChallenge(row: DbChallenge): Challenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    instructions: row.instructions || '',
    category: row.category as Challenge['category'],
    type: row.type as Challenge['type'],
    duration: row.duration_minutes as Challenge['duration'],
    xpReward: row.xp_reward,
    maxParticipants: row.max_participants || 0,
    currentParticipants: row.current_participants,
    verificationMethod: row.verification_method as Challenge['verificationMethod'],
    imageUrl: row.image_url || '',
    status: row.status as Challenge['status'],
    tags: [],
    location: row.location_name ? {
      name: row.location_name,
      address: row.location_address || undefined,
    } : undefined,
    schedule: {
      type: (row.schedule_type === 'flexible' ? 'anytime' : row.schedule_type) as 'anytime' | 'fixed' | 'range' | 'recurring',
    },
    isMultiPerson: row.is_multi_person,
    minTeamSize: row.min_team_size || undefined,
    maxTeamSize: row.max_team_size || undefined,
    createdAt: new Date(row.created_at),
    publishedAt: row.published_at ? new Date(row.published_at) : undefined,
  };
}

function mapChallengeToDb(challenge: Partial<Challenge> & { title: string; description: string }): Partial<DbChallenge> {
  const db: Record<string, unknown> = {};
  if (challenge.title !== undefined) db.title = challenge.title;
  if (challenge.description !== undefined) db.description = challenge.description;
  if (challenge.instructions !== undefined) db.instructions = challenge.instructions;
  if (challenge.category !== undefined) db.category = challenge.category;
  if (challenge.type !== undefined) db.type = challenge.type;
  if (challenge.duration !== undefined) db.duration_minutes = challenge.duration;
  if (challenge.xpReward !== undefined) db.xp_reward = challenge.xpReward;
  if (challenge.verificationMethod !== undefined) db.verification_method = challenge.verificationMethod;
  if (challenge.maxParticipants !== undefined) db.max_participants = challenge.maxParticipants;
  if (challenge.imageUrl !== undefined) db.image_url = challenge.imageUrl;
  if (challenge.status !== undefined) db.status = challenge.status;
  if (challenge.isMultiPerson !== undefined) db.is_multi_person = challenge.isMultiPerson;
  if (challenge.minTeamSize !== undefined) db.min_team_size = challenge.minTeamSize;
  if (challenge.maxTeamSize !== undefined) db.max_team_size = challenge.maxTeamSize;
  if (challenge.location?.name) db.location_name = challenge.location.name;
  if (challenge.location?.address) db.location_address = challenge.location.address;
  if (challenge.schedule?.type) db.schedule_type = challenge.schedule.type === 'anytime' ? 'flexible' : challenge.schedule.type;
  return db as Partial<DbChallenge>;
}

function getLevelName(level: number): 'starter' | 'helper' | 'supporter' | 'champion' {
  if (level >= 4) return 'champion';
  if (level >= 3) return 'supporter';
  if (level >= 2) return 'helper';
  return 'starter';
}

function mapDbSubmission(row: DbSubmission): Submission {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    challengeTitle: row.challenges?.title || 'Unknown Challenge',
    studentId: row.user_id,
    studentName: row.users?.name || 'Unknown User',
    studentAvatar: row.users?.avatar || '',
    studentLevel: getLevelName(row.users?.level || 1),
    status: row.status as Submission['status'],
    proofType: (row.proof_type || 'photo') as Submission['proofType'],
    proofUrl: row.proof_url || undefined,
    proofText: row.proof_text || undefined,
    caption: row.caption || undefined,
    submittedAt: new Date(row.submitted_at || row.created_at),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    rating: row.ngo_rating || undefined,
    feedback: row.ngo_feedback || undefined,
    xpAwarded: row.xp_earned || undefined,
  };
}

// ============================================
// Auth Store (Supabase Auth + Organization)
// ============================================

// Database row type for organization
interface DbOrganization {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  logo: string | null;
  website: string | null;
  contact_email: string | null;
  category: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
}

function mapDbOrganization(row: DbOrganization): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    mission: row.mission || '',
    logo: row.logo || '',
    email: row.contact_email || '',
    website: row.website || '',
    category: row.category as Organization['category'],
    verificationStatus: row.verification_status,
    rejectionReason: row.rejection_reason || undefined,
    verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
    verified: row.verification_status === 'verified',
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: new Date(row.created_at),
  };
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  organization: Organization | null;
  organizationId: string | null;
  userEmail: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

// Helper function to check if current user is a SolvTerra admin
async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('get_admin_info');
    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}

async function loadUserOrganization(userId: string): Promise<Organization | null> {
  // First, get the organization_id from ngo_admins
  const { data: adminData, error: adminError } = await supabase
    .from('ngo_admins')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (adminError || !adminData) {
    console.log('No organization found for user:', userId);
    return null;
  }

  // Then, get the organization details
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', adminData.organization_id)
    .single();

  if (orgError || !orgData) {
    console.error('Failed to load organization:', orgError);
    return null;
  }

  return mapDbOrganization(orgData as DbOrganization);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  organization: null,
  organizationId: null,
  userEmail: null,
  userId: null,

  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      if (session?.user) {
        const organization = await loadUserOrganization(session.user.id);
        set({
          isAuthenticated: true,
          isLoading: false,
          organization,
          organizationId: organization?.id || null,
          userEmail: session.user.email || null,
          userId: session.user.id,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  refreshOrganization: async () => {
    const { userId } = get();
    if (!userId) return;

    const organization = await loadUserOrganization(userId);
    set({
      organization,
      organizationId: organization?.id || null,
    });
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user is a SolvTerra admin
        const isAdmin = await checkIsAdmin();

        // If admin, don't load NGO organization - redirect to admin panel
        if (isAdmin) {
          return { success: true, isAdmin: true };
        }

        const organization = await loadUserOrganization(data.user.id);
        set({
          isAuthenticated: true,
          organization,
          organizationId: organization?.id || null,
          userEmail: data.user.email || null,
          userId: data.user.id,
        });
        return { success: true, isAdmin: false };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({
      isAuthenticated: false,
      organization: null,
      organizationId: null,
      userEmail: null,
      userId: null,
    });
  },
}));

// ============================================
// Challenge Store (Supabase-backed)
// ============================================

// Helper to get current organization ID from auth store
function getOrgId(): string | null {
  return useAuthStore.getState().organizationId;
}

interface ChallengeState {
  challenges: Challenge[];
  stats: DashboardStats;
  loading: boolean;
  loadChallenges: () => Promise<void>;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'currentParticipants'>) => Promise<void>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  publishChallenge: (id: string) => Promise<void>;
  pauseChallenge: (id: string) => Promise<void>;
}

function computeStats(challenges: Challenge[], pendingSubmissions: number): DashboardStats {
  const activeChallenges = challenges.filter(c => c.status === 'active').length;
  const totalParticipants = challenges.reduce((sum, c) => sum + c.currentParticipants, 0);
  return {
    totalChallenges: challenges.length,
    activeChallenges,
    totalParticipants,
    pendingSubmissions,
    approvalRate: 85,
    totalVolunteerHours: Math.round(totalParticipants * 0.3 * 10) / 10,
    averageRating: 4.5,
  };
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  stats: { totalChallenges: 0, activeChallenges: 0, totalParticipants: 0, pendingSubmissions: 0, approvalRate: 0, totalVolunteerHours: 0, averageRating: 0 },
  loading: true,

  loadChallenges: async () => {
    const orgId = getOrgId();
    if (!orgId) {
      console.log('No organization ID, skipping challenge load');
      set({ loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load challenges:', error);
      showError('Challenges konnten nicht geladen werden');
      set({ loading: false });
      return;
    }

    const challenges = (data || []).map(mapDbChallenge);
    const pendingCount = useSubmissionStore.getState().pendingCount;
    set({ challenges, stats: computeStats(challenges, pendingCount), loading: false });
  },

  addChallenge: async (challenge) => {
    const orgId = getOrgId();
    if (!orgId) {
      showError('Keine Organisation gefunden');
      return;
    }

    const dbData = mapChallengeToDb(challenge as Challenge);
    const { data, error } = await supabase
      .from('challenges')
      .insert({ ...dbData, organization_id: orgId, current_participants: 0 })
      .select()
      .single();

    if (error) {
      console.error('Failed to add challenge:', error);
      showError('Challenge konnte nicht erstellt werden');
      return;
    }

    const newChallenge = mapDbChallenge(data);
    set((state) => {
      const challenges = [...state.challenges, newChallenge];
      return { challenges, stats: computeStats(challenges, useSubmissionStore.getState().pendingCount) };
    });
  },

  updateChallenge: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.duration !== undefined) dbUpdates.duration_minutes = updates.duration;
    if (updates.xpReward !== undefined) dbUpdates.xp_reward = updates.xpReward;
    if (updates.verificationMethod !== undefined) dbUpdates.verification_method = updates.verificationMethod;
    if (updates.maxParticipants !== undefined) dbUpdates.max_participants = updates.maxParticipants;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('challenges')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update challenge:', error);
      showError('Challenge konnte nicht aktualisiert werden');
      return;
    }

    set((state) => {
      const challenges = state.challenges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      return { challenges, stats: computeStats(challenges, useSubmissionStore.getState().pendingCount) };
    });
  },

  deleteChallenge: async (id) => {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete challenge:', error);
      showError('Challenge konnte nicht gelöscht werden');
      return;
    }

    set((state) => {
      const challenges = state.challenges.filter((c) => c.id !== id);
      return { challenges, stats: computeStats(challenges, useSubmissionStore.getState().pendingCount) };
    });
  },

  publishChallenge: async (id) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'active', published_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to publish challenge:', error);
      showError('Challenge konnte nicht veröffentlicht werden');
      return;
    }

    set((state) => {
      const challenges = state.challenges.map((c) =>
        c.id === id ? { ...c, status: 'active' as const, publishedAt: new Date() } : c
      );
      return { challenges, stats: computeStats(challenges, useSubmissionStore.getState().pendingCount) };
    });
  },

  pauseChallenge: async (id) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'paused' })
      .eq('id', id);

    if (error) {
      console.error('Failed to pause challenge:', error);
      showError('Challenge konnte nicht pausiert werden');
      return;
    }

    set((state) => {
      const challenges = state.challenges.map((c) =>
        c.id === id ? { ...c, status: 'paused' as const } : c
      );
      return { challenges, stats: computeStats(challenges, useSubmissionStore.getState().pendingCount) };
    });
  },
}));

// ============================================
// Submission Store (Supabase-backed)
// ============================================

interface SubmissionState {
  submissions: Submission[];
  pendingCount: number;
  loading: boolean;
  loadSubmissions: () => Promise<void>;
  approveSubmission: (id: string, rating: number, feedback?: string) => Promise<void>;
  rejectSubmission: (id: string, feedback: string) => Promise<void>;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  pendingCount: 0,
  loading: true,

  loadSubmissions: async () => {
    const orgId = getOrgId();
    if (!orgId) {
      console.log('No organization ID, skipping submission load');
      set({ submissions: [], pendingCount: 0, loading: false });
      return;
    }

    // Fetch submissions for challenges belonging to our organization
    const { data: orgChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('organization_id', orgId);

    if (!orgChallenges || orgChallenges.length === 0) {
      set({ submissions: [], pendingCount: 0, loading: false });
      return;
    }

    const challengeIds = orgChallenges.map(c => c.id);

    const { data, error } = await supabase
      .from('submissions')
      .select('*, challenges(*), users(*)')
      .in('challenge_id', challengeIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load submissions:', error);
      showError('Einreichungen konnten nicht geladen werden');
      set({ loading: false });
      return;
    }

    const submissions = (data || []).map(mapDbSubmission);
    const pendingCount = submissions.filter(s => s.status === 'submitted').length;
    set({ submissions, pendingCount, loading: false });
  },

  approveSubmission: async (id, rating, feedback) => {
    // Get the submission to find xp_reward from the challenge
    const state = useSubmissionStore.getState();
    const submission = state.submissions.find(s => s.id === id);
    const challenge = useChallengeStore.getState().challenges.find(
      c => c.id === submission?.challengeId
    );
    const xpEarned = challenge?.xpReward || 0;

    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        ngo_rating: rating,
        ngo_feedback: feedback || null,
        xp_earned: xpEarned,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to approve submission:', error);
      showError('Einreichung konnte nicht genehmigt werden');
      return;
    }

    // Update user XP
    if (submission) {
      const { data: userData } = await supabase
        .from('users')
        .select('xp')
        .eq('id', submission.studentId)
        .single();

      if (userData) {
        await supabase
          .from('users')
          .update({ xp: (userData.xp || 0) + xpEarned })
          .eq('id', submission.studentId);
      }
    }

    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? { ...s, status: 'approved' as const, reviewedAt: new Date(), rating, feedback, xpAwarded: xpEarned }
          : s
      ),
      pendingCount: Math.max(0, state.pendingCount - 1),
    }));
  },

  rejectSubmission: async (id, feedback) => {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        ngo_feedback: feedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to reject submission:', error);
      showError('Einreichung konnte nicht abgelehnt werden');
      return;
    }

    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? { ...s, status: 'rejected' as const, reviewedAt: new Date(), feedback }
          : s
      ),
      pendingCount: Math.max(0, state.pendingCount - 1),
    }));
  },
}));

// ============================================
// Community Store (mock data - unchanged)
// ============================================

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
