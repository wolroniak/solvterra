// Challenge State Store
// Manages challenges, submissions, and filtering
// Backed by Supabase for real-time sync

import { create } from 'zustand';
import type {
  Challenge,
  Submission,
  ChallengeCategory,
  ChallengeDuration,
  ChallengeType,
  FilterState,
  SubmissionStatus,
  Organization,
} from '@solvterra/shared';
import {
  filterChallenges,
  MAX_ACTIVE_CHALLENGES,
} from '@solvterra/shared';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

// Helper to get the current authenticated user's ID
function getCurrentUserId(): string | null {
  return useUserStore.getState().user?.id || null;
}

function getCurrentUserName(): string {
  return useUserStore.getState().user?.name || 'Unbekannt';
}

// Database row types
interface DbOrganization {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  logo: string | null;
  website: string | null;
  contact_email: string | null;
  category: string | null;
  is_verified: boolean;
  created_at: string;
}

interface DbChallenge {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  instructions: string | null;
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
  organizations?: DbOrganization;
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
}

// Mappers
function mapDbOrganization(row: DbOrganization): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    mission: row.mission || undefined,
    logoUrl: row.logo || '',
    website: row.website || undefined,
    contactEmail: row.contact_email || undefined,
    verified: row.is_verified,
    verificationStatus: row.is_verified ? 'verified' : 'pending',
    ratingAvg: 4.5,
    ratingCount: 0,
    category: (row.category || 'social') as ChallengeCategory,
    createdAt: new Date(row.created_at),
  };
}

function mapDbChallenge(row: DbChallenge): Challenge {
  const org: Organization = row.organizations ? mapDbOrganization(row.organizations) : {
    id: row.organization_id,
    name: 'Unknown Organization',
    description: '',
    logoUrl: '',
    verified: false,
    verificationStatus: 'pending',
    ratingAvg: 0,
    ratingCount: 0,
    category: 'social',
    createdAt: new Date(),
  };

  return {
    id: row.id,
    organizationId: row.organization_id,
    organization: org,
    title: row.title,
    description: row.description,
    instructions: row.instructions || '',
    category: row.category as ChallengeCategory,
    type: row.type as ChallengeType,
    durationMinutes: row.duration_minutes as ChallengeDuration,
    verificationMethod: row.verification_method as Challenge['verificationMethod'],
    maxParticipants: row.max_participants || 0,
    currentParticipants: row.current_participants,
    xpReward: row.xp_reward,
    status: row.status as Challenge['status'],
    imageUrl: row.image_url || undefined,
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
    updatedAt: new Date(row.created_at),
  };
}

function mapDbSubmission(row: DbSubmission, challenge: Challenge): Submission {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    challenge,
    userId: row.user_id,
    userName: getCurrentUserName(),
    status: row.status as SubmissionStatus,
    proofType: (row.proof_type || 'none') as 'photo' | 'text' | 'none',
    proofUrl: row.proof_url || undefined,
    proofText: row.proof_text || undefined,
    caption: row.caption || undefined,
    submittedAt: row.submitted_at ? new Date(row.submitted_at) : undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    ngoRating: row.ngo_rating || undefined,
    ngoFeedback: row.ngo_feedback || undefined,
    xpEarned: row.xp_earned || undefined,
    createdAt: new Date(row.created_at),
  };
}

interface ChallengeState {
  // Challenge list
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  isLoading: boolean;

  // Filters
  filters: FilterState;

  // User submissions
  submissions: Submission[];

  // Current challenge being viewed/completed
  currentChallenge: Challenge | null;
  currentSubmission: Submission | null;

  // Actions
  loadChallenges: () => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;

  // Challenge actions
  selectChallenge: (challenge: Challenge) => void;
  acceptChallenge: (challengeId: string) => Promise<Submission | undefined>;
  cancelChallenge: (submissionId: string) => Promise<void>;

  // Submission actions
  submitProof: (submissionId: string, proof: { type: 'photo' | 'text'; url?: string; text?: string; caption?: string }) => Promise<void>;
  updateProof: (submissionId: string, proof: { type: 'photo' | 'text'; url?: string; text?: string; caption?: string }) => Promise<void>;

  // Getters
  getSubmissionsByStatus: (status: SubmissionStatus) => Submission[];
  getChallengeById: (id: string) => Challenge | undefined;
  getActiveCount: () => number;
  canAcceptChallenge: () => boolean;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  // Initial state
  challenges: [],
  filteredChallenges: [],
  isLoading: false,
  filters: {
    categories: [],
    durations: [],
    types: [],
  },
  submissions: [],
  currentChallenge: null,
  currentSubmission: null,

  // Load challenges from Supabase
  loadChallenges: async () => {
    set({ isLoading: true });

    // Fetch active challenges with organization data
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('*, organizations(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (challengeError) {
      console.error('Failed to load challenges:', challengeError);
      Alert.alert('Fehler', 'Challenges konnten nicht geladen werden. Bitte versuche es erneut.');
      set({ isLoading: false });
      return;
    }

    const challenges = (challengeData || []).map(mapDbChallenge);

    // Fetch user's submissions (only if authenticated)
    const userId = getCurrentUserId();
    const { data: submissionData, error: submissionError } = userId
      ? await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      : { data: null, error: null };

    let submissions: Submission[] = [];
    if (!submissionError && submissionData) {
      submissions = submissionData.map((sub: DbSubmission) => {
        const challenge = challenges.find(c => c.id === sub.challenge_id);
        if (challenge) {
          return mapDbSubmission(sub, challenge);
        }
        // Create a placeholder for challenges that might not be active anymore
        return mapDbSubmission(sub, {
          id: sub.challenge_id,
          organizationId: '',
          organization: { id: '', name: '', description: '', logoUrl: '', verified: false, verificationStatus: 'pending', ratingAvg: 0, ratingCount: 0, category: 'social', createdAt: new Date() },
          title: 'Challenge',
          description: '',
          instructions: '',
          category: 'social',
          type: 'digital',
          durationMinutes: 10,
          verificationMethod: 'photo',
          maxParticipants: 0,
          currentParticipants: 0,
          xpReward: 20,
          status: 'active',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }

    set({
      challenges,
      filteredChallenges: challenges,
      submissions,
      isLoading: false,
    });
  },

  // Filtering
  setFilters: (newFilters: Partial<FilterState>) => {
    const { challenges, filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    const filtered = filterChallenges(challenges, {
      categories: updatedFilters.categories,
      durations: updatedFilters.durations,
      types: updatedFilters.types,
    });
    set({
      filters: updatedFilters,
      filteredChallenges: filtered,
    });
  },

  clearFilters: () => {
    const { challenges } = get();
    set({
      filters: { categories: [], durations: [], types: [] },
      filteredChallenges: challenges,
    });
  },

  // Challenge actions
  selectChallenge: (challenge: Challenge) => {
    set({ currentChallenge: challenge });
  },

  acceptChallenge: async (challengeId: string) => {
    const { challenges, submissions } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const userId = getCurrentUserId();
    if (!userId) {
      Alert.alert('Fehler', 'Du musst angemeldet sein, um eine Challenge anzunehmen.');
      return;
    }

    // Insert submission into Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        status: 'in_progress',
        proof_type: challenge.verificationMethod === 'ngo_confirmation' ? 'none' : challenge.verificationMethod,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to accept challenge:', error);
      Alert.alert('Fehler', 'Challenge konnte nicht angenommen werden.');
      return;
    }

    // Increment participant count
    await supabase.rpc('increment_participants', { challenge_uuid: challengeId });

    const newSubmission = mapDbSubmission(data, challenge);

    // Update local state
    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId
        ? { ...c, currentParticipants: c.currentParticipants + 1 }
        : c
    );

    set({
      submissions: [newSubmission, ...submissions],
      challenges: updatedChallenges,
      filteredChallenges: updatedChallenges,
      currentSubmission: newSubmission,
    });

    return newSubmission;
  },

  cancelChallenge: async (submissionId: string) => {
    const { submissions, challenges } = get();
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission) return;

    // Delete from Supabase
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId);

    if (error) {
      console.error('Failed to cancel challenge:', error);
      Alert.alert('Fehler', 'Challenge konnte nicht abgebrochen werden.');
      return;
    }

    // Decrement participant count
    await supabase
      .from('challenges')
      .update({ current_participants: Math.max(0, (challenges.find(c => c.id === submission.challengeId)?.currentParticipants || 1) - 1) })
      .eq('id', submission.challengeId);

    const updatedSubmissions = submissions.filter((s) => s.id !== submissionId);
    const updatedChallenges = challenges.map((c) =>
      c.id === submission.challengeId
        ? { ...c, currentParticipants: Math.max(0, c.currentParticipants - 1) }
        : c
    );

    set({
      submissions: updatedSubmissions,
      challenges: updatedChallenges,
      filteredChallenges: updatedChallenges,
    });
  },

  // Submission actions
  submitProof: async (submissionId: string, proof) => {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'submitted',
        proof_type: proof.type,
        proof_url: proof.url || null,
        proof_text: proof.text || null,
        caption: proof.caption || null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Failed to submit proof:', error);
      Alert.alert('Fehler', 'Einreichung konnte nicht hochgeladen werden. Bitte versuche es erneut.');
      return;
    }

    const { submissions } = get();
    const updatedSubmissions = submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'submitted' as SubmissionStatus,
            proofType: proof.type as 'photo' | 'text',
            proofUrl: proof.url,
            proofText: proof.text,
            caption: proof.caption,
            submittedAt: new Date(),
          }
        : s
    );

    set({ submissions: updatedSubmissions });
  },

  // Update existing proof and reset status to 'submitted'
  updateProof: async (submissionId: string, proof) => {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'submitted',
        proof_type: proof.type,
        proof_url: proof.url || null,
        proof_text: proof.text || null,
        caption: proof.caption || null,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        ngo_rating: null,
        ngo_feedback: null,
        xp_earned: null,
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Failed to update proof:', error);
      Alert.alert('Fehler', 'Einreichung konnte nicht aktualisiert werden. Bitte versuche es erneut.');
      return;
    }

    const { submissions } = get();
    const updatedSubmissions = submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'submitted' as SubmissionStatus,
            proofType: proof.type as 'photo' | 'text',
            proofUrl: proof.url,
            proofText: proof.text,
            caption: proof.caption,
            submittedAt: new Date(),
            reviewedAt: undefined,
            ngoRating: undefined,
            ngoFeedback: undefined,
            xpEarned: undefined,
          }
        : s
    );

    set({ submissions: updatedSubmissions });
  },

  // Getters
  getSubmissionsByStatus: (status: SubmissionStatus) => {
    return get().submissions.filter((s) => s.status === status);
  },

  getChallengeById: (id: string) => {
    return get().challenges.find((c) => c.id === id);
  },

  getActiveCount: () => {
    return get().submissions.filter((s) => s.status === 'in_progress').length;
  },

  canAcceptChallenge: () => {
    const activeCount = get().submissions.filter((s) => s.status === 'in_progress').length;
    return activeCount < MAX_ACTIVE_CHALLENGES;
  },
}));
