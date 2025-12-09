// Challenge State Store
// Manages challenges, submissions, and filtering

import { create } from 'zustand';
import type {
  Challenge,
  Submission,
  ChallengeCategory,
  ChallengeDuration,
  ChallengeType,
  FilterState,
  SubmissionStatus,
} from '@solvterra/shared';
import {
  MOCK_CHALLENGES,
  MOCK_USER_SUBMISSIONS,
  getActiveChallenges,
  filterChallenges,
  XP_BY_DURATION,
  MAX_ACTIVE_CHALLENGES,
} from '@solvterra/shared';

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
  acceptChallenge: (challengeId: string) => Submission;
  cancelChallenge: (submissionId: string) => void;

  // Submission actions
  submitProof: (submissionId: string, proof: { type: 'photo' | 'text'; url?: string; text?: string; caption?: string }) => void;

  // Demo helpers
  simulateApproval: (submissionId: string, rating: number) => void;
  simulateRejection: (submissionId: string, feedback: string) => void;

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
  submissions: [...MOCK_USER_SUBMISSIONS],
  currentChallenge: null,
  currentSubmission: null,

  // Load challenges
  loadChallenges: async () => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const active = getActiveChallenges();
    set({
      challenges: active,
      filteredChallenges: active,
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

  acceptChallenge: (challengeId: string) => {
    const { challenges, submissions } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Create new submission
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      challengeId,
      challenge,
      userId: 'user-1',
      userName: 'Max Mustermann',
      status: 'in_progress',
      proofType: challenge.verificationMethod === 'ngo_confirmation' ? 'none' : challenge.verificationMethod,
      createdAt: new Date(),
    };

    // Update challenge participant count
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

  cancelChallenge: (submissionId: string) => {
    const { submissions, challenges } = get();
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission) return;

    // Remove submission
    const updatedSubmissions = submissions.filter((s) => s.id !== submissionId);

    // Decrease participant count
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
  submitProof: (submissionId: string, proof) => {
    const { submissions } = get();
    const updatedSubmissions = submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'submitted' as SubmissionStatus,
            proofType: proof.type,
            proofUrl: proof.url,
            proofText: proof.text,
            caption: proof.caption,
            submittedAt: new Date(),
          }
        : s
    );

    set({ submissions: updatedSubmissions });
  },

  // Demo helpers
  simulateApproval: (submissionId: string, rating: number) => {
    const { submissions } = get();
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission) return;

    const xpReward = XP_BY_DURATION[submission.challenge.durationMinutes as ChallengeDuration];

    const updatedSubmissions = submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'approved' as SubmissionStatus,
            reviewedAt: new Date(),
            ngoRating: rating,
            ngoFeedback: 'Großartige Arbeit! Vielen Dank für dein Engagement.',
            xpEarned: xpReward,
          }
        : s
    );

    set({ submissions: updatedSubmissions });
  },

  simulateRejection: (submissionId: string, feedback: string) => {
    const { submissions } = get();
    const updatedSubmissions = submissions.map((s) =>
      s.id === submissionId
        ? {
            ...s,
            status: 'rejected' as SubmissionStatus,
            reviewedAt: new Date(),
            ngoFeedback: feedback,
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
