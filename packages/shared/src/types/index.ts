// SolvTerra Shared Types
// Based on PRD-SolvTerra.md Data Models

// ============================================
// ENUMS
// ============================================

export type ChallengeCategory =
  | 'environment'
  | 'social'
  | 'education'
  | 'health'
  | 'animals'
  | 'culture'
  | 'other';

export type ChallengeType = 'digital' | 'onsite';

export type ChallengeDuration = 5 | 10 | 15 | 30;

export type VerificationMethod = 'photo' | 'text' | 'ngo_confirmation';

export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'archived';

export type SubmissionStatus =
  | 'accepted'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected';

export type UserLevel = 'starter' | 'helper' | 'supporter' | 'champion' | 'legend';

// ============================================
// ORGANIZATION
// ============================================

export interface Organization {
  id: string;
  name: string;
  description: string;
  mission?: string;
  logoUrl: string;
  website?: string;
  contactEmail?: string;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  category: string;
  createdAt: Date;
}

// ============================================
// USER (Student)
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  interests: ChallengeCategory[];
  xpTotal: number;
  level: UserLevel;
  completedChallenges: number;
  hoursContributed: number;
  badges: UserBadge[];
  savedChallengeIds: string[];
  createdAt: Date;
  onboardingCompleted: boolean;
}

// ============================================
// NGO ADMIN
// ============================================

export interface NgoAdmin {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  avatarUrl?: string;
  createdAt: Date;
}

// ============================================
// CHALLENGE
// ============================================

// Schedule types for different challenge timing options
export type ScheduleType = 'anytime' | 'fixed' | 'range' | 'recurring';

export interface ChallengeLocation {
  name: string;                    // e.g., "Stadtpark Frankfurt"
  address?: string;                // Full address
  coordinates?: {
    lat: number;
    lng: number;
  };
  meetingPoint?: string;           // e.g., "Am Haupteingang"
  additionalInfo?: string;         // e.g., "Parkplätze vorhanden"
}

export interface ChallengeSchedule {
  type: ScheduleType;
  startDate?: Date;                // For fixed/range
  endDate?: Date;                  // For range (also serves as deadline)
  timeSlots?: string[];            // e.g., ["Mo-Fr 9-17 Uhr", "Sa 10-14 Uhr"]
  deadline?: Date;                 // Hard deadline for completion
  isFlexible?: boolean;            // Can be done anytime within range
  timezone?: string;               // Default: "Europe/Berlin"
}

export interface ChallengeContact {
  name: string;                    // Contact person name
  role?: string;                   // e.g., "Ehrenamtskoordinator"
  email?: string;
  phone?: string;
  preferredMethod: 'email' | 'phone' | 'app';
  responseTime?: string;           // e.g., "Innerhalb von 24 Stunden"
}

// Teammate seeker for matchmaking
export interface TeammateSeeker {
  id: string;
  name: string;
  avatarUrl?: string;
  level: UserLevel;
  joinedAt: Date;
}

export interface Challenge {
  id: string;
  organizationId: string;
  organization: Organization;
  title: string;
  description: string;
  instructions: string;
  category: ChallengeCategory;
  type: ChallengeType;
  durationMinutes: ChallengeDuration;
  verificationMethod: VerificationMethod;
  maxParticipants: number;
  currentParticipants: number;
  xpReward: number;
  status: ChallengeStatus;
  imageUrl?: string;
  tags?: string[];

  // Location & Schedule
  location?: ChallengeLocation;
  schedule?: ChallengeSchedule;

  // Contact information (required for all challenges)
  contact?: ChallengeContact;

  // Multi-Person Challenge fields
  isMultiPerson?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  teamDescription?: string;

  // Solo join for team challenges (matchmaking)
  allowSoloJoin?: boolean;          // Can join without bringing team
  teammateSeekers?: TeammateSeeker[]; // People looking for teammates

  // Legacy field (use schedule.deadline instead)
  deadline?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Maximum active challenges per user
export const MAX_ACTIVE_CHALLENGES = 5;

// ============================================
// SUBMISSION
// ============================================

export interface Submission {
  id: string;
  challengeId: string;
  challenge: Challenge;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  status: SubmissionStatus;
  proofType: 'photo' | 'text' | 'none';
  proofUrl?: string;
  proofText?: string;
  caption?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  ngoRating?: number; // 1-5
  ngoFeedback?: string;
  xpEarned?: number;
  createdAt: Date;
}

// ============================================
// GAMIFICATION - BADGES
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // Icon identifier for the app
  category: 'milestone' | 'category' | 'special' | 'streak';
  criteria: string;
  xpBonus?: number;
}

export interface UserBadge {
  badge: Badge;
  earnedAt: Date;
}

// ============================================
// GAMIFICATION - XP
// ============================================

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  source: 'challenge' | 'badge' | 'streak' | 'bonus';
  sourceId?: string;
  description: string;
  createdAt: Date;
}

// ============================================
// STATISTICS
// ============================================

export interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  totalXp: number;
  level: UserLevel;
  hoursContributed: number;
  badgesEarned: number;
  ngosSupported: number;
  currentStreak: number;
  longestStreak: number;
  challengesByCategory: Record<ChallengeCategory, number>;
}

export interface OrganizationStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalVolunteerHours: number;
  averageRating: number;
  totalParticipants: number;
  weeklyData: WeeklyDataPoint[];
}

export interface WeeklyDataPoint {
  date: string;
  submissions: number;
  approvals: number;
}

// ============================================
// CHALLENGE TEMPLATES
// ============================================

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ChallengeCategory;
  type: ChallengeType;
  suggestedDuration: ChallengeDuration;
  suggestedVerification: VerificationMethod;
  defaultDescription: string;
  defaultInstructions: string;
}

// ============================================
// NOTIFICATION
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'submission_approved' | 'submission_rejected' | 'badge_earned' | 'level_up' | 'new_challenge';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// UI HELPER TYPES
// ============================================

export interface FilterState {
  categories: ChallengeCategory[];
  durations: ChallengeDuration[];
  types: ChallengeType[];
}

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

// XP Level Thresholds
export const XP_LEVELS: Record<UserLevel, number> = {
  starter: 0,
  helper: 100,
  supporter: 500,
  champion: 2000,
  legend: 5000,
};

// XP Rewards by Duration
export const XP_BY_DURATION: Record<ChallengeDuration, number> = {
  5: 10,
  10: 20,
  15: 30,
  30: 50,
};

// ============================================
// COMMUNITY FEED & POSTS
// ============================================

// Reaction types - themed for achievements, not generic social media
export type ReactionType = 'heart' | 'celebrate' | 'inspiring' | 'thanks';

// Post types - distinction from social media: everything tied to achievements
export type CommunityPostType =
  | 'ngo_promotion'      // NGO promotes a challenge
  | 'success_story'      // User shares verified completion story
  | 'challenge_completed' // Auto-generated on completion
  | 'badge_earned'        // Auto-generated on badge
  | 'level_up'            // Auto-generated on level up
  | 'team_challenge'      // Auto-generated team completion
  | 'streak_achieved';    // Auto-generated streak

// Comment on a community post
export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userLevel?: UserLevel;
  content: string;
  createdAt: Date;
}

// Linked challenge info for posts
export interface LinkedChallengeInfo {
  id: string;
  title: string;
  imageUrl?: string;
  organizationName: string;
  category: ChallengeCategory;
  xpReward: number;
  durationMinutes: ChallengeDuration;
}

// Main Community Post interface
export interface CommunityPost {
  id: string;
  type: CommunityPostType;

  // Author - can be user or organization
  authorType: 'user' | 'organization';
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorLevel?: UserLevel; // For users only
  organizationId?: string; // For NGO posts
  organizationLogoUrl?: string; // For NGO posts

  // Content
  title?: string;           // For NGO promotions, success stories
  content?: string;         // Post text content
  imageUrl?: string;        // Post image

  // Challenge Link (for promotions and success stories)
  linkedChallengeId?: string;
  linkedChallenge?: LinkedChallengeInfo;

  // For verified success stories
  submissionId?: string;    // Link to verified submission
  xpEarned?: number;        // XP earned from the challenge

  // Auto-generated activity fields (backward compatible)
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  newLevel?: UserLevel;
  teamMemberNames?: string[];
  streakDays?: number;

  // Social interactions - reactions instead of simple likes
  reactions: Record<ReactionType, number>;  // {heart: 5, celebrate: 3, ...}
  userReaction?: ReactionType;              // Current user's reaction
  totalReactions: number;                   // Sum of all reactions
  commentsCount: number;
  comments?: CommunityComment[];            // First few comments for preview

  // Visibility & Moderation
  isHighlighted?: boolean;  // NGO can highlight important posts
  isPinned?: boolean;       // Pinned to top

  createdAt: Date;
}

// Legacy FeedItem type for backward compatibility
export type FeedItemType =
  | 'challenge_completed'
  | 'badge_earned'
  | 'level_up'
  | 'team_challenge'
  | 'streak_achieved';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userLevel?: UserLevel;
  // Content based on type
  challengeId?: string;
  challengeTitle?: string;
  challengeImageUrl?: string;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  newLevel?: UserLevel;
  teamMemberNames?: string[];
  streakDays?: number;
  // Social
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
}

// Reaction icons mapping for UI
export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  heart: { emoji: '❤️', label: 'Gefällt mir', color: '#ef4444' },
  celebrate: { emoji: '🎉', label: 'Feiern', color: '#f59e0b' },
  inspiring: { emoji: '💪', label: 'Inspirierend', color: '#8b5cf6' },
  thanks: { emoji: '🙏', label: 'Danke', color: '#06b6d4' },
};

// ============================================
// FRIENDS / SOCIAL
// ============================================

export interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  level: UserLevel;
  xpTotal: number;
  isFriend: boolean;
}
