// Mock data for the NGO Web Dashboard
// Demo data for presentation - aligned with mobile app data
// Presentation date: December 11, 2025

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Organization {
  id: string;
  name: string;
  logo: string;
  description: string;
  mission: string;
  email: string;
  website: string;
  category: 'environment' | 'social' | 'education' | 'health' | 'animals' | 'culture';

  // Verification
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: Date;

  // Legacy field (deprecated)
  verified?: boolean;

  // Stats
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}

// Schedule type for different challenge timing options
export type ScheduleType = 'anytime' | 'fixed' | 'range' | 'recurring';

// Preferred contact method
export type ContactMethod = 'email' | 'phone' | 'app';

// Challenge Location - Full structure aligned with mobile app
export interface ChallengeLocation {
  name: string;                      // e.g., "Stadtpark Frankfurt"
  address?: string;                  // Full address
  coordinates?: {
    lat: number;
    lng: number;
  };
  meetingPoint?: string;             // e.g., "Am Haupteingang"
  additionalInfo?: string;           // e.g., "Parkplätze vorhanden"
}

// Challenge Schedule - Full structure aligned with mobile app
export interface ChallengeSchedule {
  type: ScheduleType;
  startDate?: Date;                  // For fixed/range
  endDate?: Date;                    // For range (also serves as deadline)
  timeSlots?: string[];              // e.g., ["Mo-Fr 9-17 Uhr", "Sa 10-14 Uhr"]
  deadline?: Date;                   // Hard deadline for completion
  isFlexible?: boolean;              // Can be done anytime within range
}

// Challenge Contact - Full structure aligned with mobile app
export interface ChallengeContact {
  name: string;                      // Contact person name
  role?: string;                     // e.g., "Ehrenamtskoordinator"
  email?: string;
  phone?: string;
  preferredMethod: ContactMethod;
  responseTime?: string;             // e.g., "Innerhalb von 24 Stunden"
}

// Teammate seeker for matchmaking (for team challenges)
export interface TeammateSeeker {
  id: string;
  name: string;
  avatarUrl?: string;
  level: 'starter' | 'helper' | 'supporter' | 'champion';
  joinedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: 'environment' | 'social' | 'education' | 'health' | 'animals' | 'culture';
  type: 'digital' | 'onsite';
  duration: 5 | 10 | 15 | 30;
  xpReward: number;
  maxParticipants: number;
  currentParticipants: number;
  verificationMethod: 'photo' | 'text' | 'ngo_confirmation';
  imageUrl: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  tags: string[];

  // Location & Schedule - Full support
  location?: ChallengeLocation;
  schedule?: ChallengeSchedule;

  // Contact information
  contact?: ChallengeContact;

  // Multi-Person Challenge fields - Full support
  isMultiPerson?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  teamDescription?: string;          // Description for team formation
  allowSoloJoin?: boolean;           // Can join without bringing team (matchmaking)
  teammateSeekers?: TeammateSeeker[]; // People looking for teammates

  createdAt: Date;
  publishedAt?: Date;
}

export interface Submission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentLevel: 'starter' | 'helper' | 'supporter' | 'champion';
  status: 'submitted' | 'approved' | 'rejected';
  proofType: 'photo' | 'text';
  proofUrl?: string;
  proofText?: string;
  caption?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  rating?: number;
  feedback?: string;
  xpAwarded?: number;
}

export interface DashboardStats {
  totalChallenges: number;
  activeChallenges: number;
  totalParticipants: number;
  pendingSubmissions: number;
  approvalRate: number;
  totalVolunteerHours: number;
  averageRating: number;
}

export interface NgoAdmin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  avatarUrl: string;
}

// ============================================
// MOCK NGO ADMIN (logged-in user)
// Aligned with Tafel Rhein-Main for demo consistency with Max's story
// ============================================

export const MOCK_NGO_ADMIN: NgoAdmin = {
  id: 'admin-2',
  name: 'Michael Helfer',
  email: 'michael.helfer@tafel-rheinmain.de',
  role: 'admin',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelTafel',
};

// ============================================
// MOCK ORGANIZATION (logged-in NGO)
// Aligned with mobile app org-2: Tafel Rhein-Main e.V.
// This creates demo consistency: Max completes Tafel challenge -> Michael reviews it
// ============================================

export const MOCK_ORGANIZATION: Organization = {
  id: 'org-2',
  name: 'Tafel Rhein-Main e.V.',
  logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
  description:
    'Die Tafel Rhein-Main sammelt einwandfreie Lebensmittel und verteilt diese an über 15.000 Bedürftige in der Region. Wir sind auf engagierte Helfer angewiesen.',
  mission: 'Lebensmittel retten. Menschen helfen.',
  email: 'kontakt@tafel-rheinmain.de',
  website: 'https://tafel-rheinmain.de',
  category: 'social',
  verificationStatus: 'verified',
  verifiedAt: new Date('2025-02-01'),
  verified: true, // Legacy
  ratingAvg: 4.9,
  ratingCount: 456,
  createdAt: new Date('2025-02-01'),
};

// ============================================
// MOCK CHALLENGES
// Tafel Rhein-Main e.V. challenges - aligned with mobile app chal-3 and team challenges
// ============================================

export const MOCK_CHALLENGES: Challenge[] = [
  // PRIMARY DEMO CHALLENGE - This is what Max completed
  {
    id: 'chal-3',
    title: 'Lebensmittel sortieren bei der Tafel',
    description:
      'Hilf uns beim Sortieren von gespendeten Lebensmitteln in unserer Ausgabestelle. Die Vorweihnachtszeit ist besonders wichtig - täglich kommen mehr Bedürftige.',
    instructions:
      '1. Komme zur Tafel-Ausgabestelle in Frankfurt-Bockenheim\n2. Hilf beim Sortieren der Lebensmittel nach Haltbarkeit\n3. Mache ein Foto bei der Arbeit\n4. Lade das Foto hoch',
    category: 'social',
    type: 'onsite',
    duration: 30,
    xpReward: 50,
    maxParticipants: 10,
    currentParticipants: 4,
    verificationMethod: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    status: 'active',
    tags: ['vor-ort', 'teamwork', 'lebensmittel'],
    location: {
      name: 'Tafel Ausgabestelle Frankfurt-Bockenheim',
      address: 'Leipziger Straße 45, 60487 Frankfurt am Main',
      meetingPoint: 'Hintereingang (Schild "Ehrenamtliche")',
      additionalInfo: 'Bitte bequeme Kleidung tragen. Handschuhe werden gestellt.',
      coordinates: { lat: 50.1155, lng: 8.6724 },
    },
    schedule: {
      type: 'recurring',
      timeSlots: ['Mo, Mi, Fr: 9-12 Uhr', 'Di, Do: 14-17 Uhr'],
      deadline: new Date('2026-01-31'),
      isFlexible: false,
    },
    contact: {
      name: 'Michael Helfer',
      role: 'Ehrenamtskoordinator',
      email: 'ehrenamt@tafel-rheinmain.de',
      phone: '+49 69 1234567',
      preferredMethod: 'phone',
      responseTime: 'Sofort während Öffnungszeiten',
    },
    createdAt: new Date('2025-10-20'),
    publishedAt: new Date('2025-10-20'),
  },
  {
    id: 'chal-tafel-2',
    title: 'Social Media Post für die Tafel',
    description:
      'Erstelle einen informativen Social Media Post über Lebensmittelverschwendung und die Arbeit der Tafel.',
    instructions:
      '1. Informiere dich auf unserer Website über Lebensmittelverschwendung\n2. Erstelle einen Post mit dem Hashtag #TafelRettetLebensmittel\n3. Poste auf Instagram, Twitter oder LinkedIn\n4. Mache einen Screenshot und lade ihn hoch',
    category: 'social',
    type: 'digital',
    duration: 10,
    xpReward: 20,
    maxParticipants: 50,
    currentParticipants: 28,
    verificationMethod: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    status: 'active',
    tags: ['social-media', 'digital', 'awareness'],
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      deadline: new Date('2025-12-31'),
    },
    contact: {
      name: 'Michael Helfer',
      role: 'Öffentlichkeitsarbeit',
      email: 'presse@tafel-rheinmain.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-11-15'),
    publishedAt: new Date('2025-11-15'),
  },
  {
    id: 'chal-tafel-3',
    title: 'Spenden-Danksagungen schreiben',
    description:
      'Schreibe persönliche Dankeskarten für unsere Lebensmittelspender. Deine Worte machen einen Unterschied!',
    instructions:
      '1. Wir schicken dir 5 Spendernamen per E-Mail\n2. Schreibe kurze, persönliche Dankestexte (3-4 Sätze pro Spender)\n3. Betone den Impact ihrer Spende\n4. Sende die Texte als Nachricht zurück',
    category: 'social',
    type: 'digital',
    duration: 15,
    xpReward: 30,
    maxParticipants: 25,
    currentParticipants: 12,
    verificationMethod: 'text',
    imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800',
    status: 'active',
    tags: ['schreiben', 'digital', 'danke'],
    schedule: {
      type: 'anytime',
      isFlexible: true,
    },
    contact: {
      name: 'Michael Helfer',
      role: 'Ehrenamtskoordinator',
      email: 'danke@tafel-rheinmain.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-11-20'),
    publishedAt: new Date('2025-11-20'),
  },
  // TEAM CHALLENGE - Aligned with shared package chal-team-3
  {
    id: 'chal-team-3',
    title: 'Flyer verteilen im Team',
    description:
      'Verteilt als Gruppe Flyer für die Tafel in Frankfurt-Nordend. Mit mehr Leuten erreicht ihr mehr Menschen!',
    instructions:
      '1. Bildet ein Team von 2-5 Personen\n2. Holt die Flyer bei der Tafel in Bockenheim ab (Leipziger Str. 45)\n3. Verteilt sie im Gebiet Frankfurt-Nordend (Karte wird bereitgestellt)\n4. Macht Fotos während der Verteilung\n5. Ladet ein Gruppenfoto hoch',
    category: 'social',
    type: 'onsite',
    duration: 30,
    xpReward: 60,
    maxParticipants: 25,
    currentParticipants: 5,
    verificationMethod: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    status: 'active',
    tags: ['team', 'vor-ort', 'flyer'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 5,
    teamDescription: 'Mit mehr Leuten erreicht ihr mehr Menschen! Lade Freunde ein.',
    allowSoloJoin: true,
    teammateSeekers: [
      {
        id: 'seeker-1',
        name: 'Sophie K.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieK',
        level: 'helper',
        joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'seeker-2',
        name: 'Niklas M.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NiklasM',
        level: 'starter',
        joinedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
    location: {
      name: 'Tafel Ausgabestelle Frankfurt-Bockenheim (Abholung)',
      address: 'Leipziger Straße 45, 60487 Frankfurt am Main',
      meetingPoint: 'Haupteingang – Flyer werden dort ausgegeben',
      additionalInfo: 'Verteilgebiet: Frankfurt-Nordend. Gebietskarte wird vor Ort ausgeteilt.',
      coordinates: { lat: 50.1155, lng: 8.6724 },
    },
    schedule: {
      type: 'recurring',
      timeSlots: ['Sa: 10-13 Uhr', 'So: 14-17 Uhr'],
      deadline: new Date('2026-01-31'),
      isFlexible: false,
    },
    contact: {
      name: 'Michael Helfer',
      role: 'Ehrenamtskoordinator',
      email: 'ehrenamt@tafel-rheinmain.de',
      phone: '+49 69 1234567',
      preferredMethod: 'phone',
      responseTime: 'Sofort während Bürozeiten',
    },
    createdAt: new Date('2025-12-01'),
    publishedAt: new Date('2025-12-01'),
  },
  {
    id: 'chal-draft-tafel',
    title: 'Weihnachtspakete packen (Entwurf)',
    description:
      'Hilf uns beim Packen von Weihnachtspaketen für bedürftige Familien. Jedes Paket bringt Freude!',
    instructions:
      '1. Komme zur Tafel-Zentrale in Frankfurt\n2. Packe Lebensmittel und kleine Geschenke in Pakete\n3. Jedes Paket wird für eine Familie zusammengestellt\n4. Mache ein Foto vom fertigen Paket',
    category: 'social',
    type: 'onsite',
    duration: 30,
    xpReward: 50,
    maxParticipants: 20,
    currentParticipants: 0,
    verificationMethod: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800',
    status: 'draft',
    tags: ['weihnachten', 'pakete', 'vor-ort'],
    createdAt: new Date('2025-12-08'),
  },
];

// ============================================
// MOCK SUBMISSIONS
// Aligned with Tafel challenges and Max's investor story
// Max's submission is PENDING - key demo moment for Michael to review
// ============================================

export const MOCK_SUBMISSIONS: Submission[] = [
  // ========== PENDING SUBMISSIONS (Review Queue) ==========
  // MAX'S SUBMISSION - PRIMARY DEMO MOMENT
  // This creates the connected narrative: Max completed the Tafel challenge, Michael reviews it
  {
    id: 'sub-max-tafel',
    challengeId: 'chal-3',
    challengeTitle: 'Lebensmittel sortieren bei der Tafel',
    studentId: 'user-1',
    studentName: 'Max Mustermann',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxStudent',
    studentLevel: 'helper',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    caption: 'Schnelle 30 Minuten in der Mittagspause! Über 50 kg Gemüse sortiert. 🥕',
    submittedAt: new Date('2025-12-11T12:45:00'),
  },
  {
    id: 'sub-1',
    challengeId: 'chal-3',
    challengeTitle: 'Lebensmittel sortieren bei der Tafel',
    studentId: 'user-lena',
    studentName: 'Lena Fischer',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    studentLevel: 'supporter',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    caption: 'Super Atmosphäre bei der Tafel! Das Team ist so nett. 💚',
    submittedAt: new Date('2025-12-11T10:30:00'),
  },
  {
    id: 'sub-2',
    challengeId: 'chal-tafel-2',
    challengeTitle: 'Social Media Post für die Tafel',
    studentId: 'user-tim',
    studentName: 'Tim Weber',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    studentLevel: 'supporter',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    caption: 'Mein Post hat 180 Likes bekommen! #TafelRettetLebensmittel 🙌',
    submittedAt: new Date('2025-12-11T09:15:00'),
  },
  {
    id: 'sub-4',
    challengeId: 'chal-tafel-3',
    challengeTitle: 'Spenden-Danksagungen schreiben',
    studentId: 'user-marie',
    studentName: 'Marie Becker',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariePink',
    studentLevel: 'starter',
    status: 'submitted',
    proofType: 'text',
    proofText: 'Liebe Bäckerei Schmidt,\n\nvielen herzlichen Dank für Ihre großzügige Brotspende! Dank Ihnen können wir jeden Tag über 50 Familien mit frischem Brot versorgen. Ihre Unterstützung macht einen echten Unterschied.\n\nMit herzlichen Grüßen,\nMarie (Freiwillige bei der Tafel)',
    submittedAt: new Date('2025-12-10T14:20:00'),
  },

  // ========== RECENTLY APPROVED ==========
  {
    id: 'sub-5',
    challengeId: 'chal-tafel-2',
    challengeTitle: 'Social Media Post für die Tafel',
    studentId: 'user-anna',
    studentName: 'Anna Schneider',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    studentLevel: 'helper',
    status: 'approved',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800',
    caption: 'Wusstet ihr, dass 1/3 aller Lebensmittel weggeworfen wird? Die Tafel rettet sie! 🌍',
    submittedAt: new Date('2025-12-09T14:20:00'),
    reviewedAt: new Date('2025-12-09T18:00:00'),
    rating: 5,
    feedback: 'Super informativer Post! Die Fakten sind perfekt recherchiert. Vielen Dank!',
    xpAwarded: 20,
  },
  {
    id: 'sub-6',
    challengeId: 'chal-3',
    challengeTitle: 'Lebensmittel sortieren bei der Tafel',
    studentId: 'user-felix',
    studentName: 'Felix Braun',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FelixGreen',
    studentLevel: 'helper',
    status: 'approved',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    caption: '2 Stunden geholfen und so viel gelernt über Lebensmittelverschwendung!',
    submittedAt: new Date('2025-12-08T11:30:00'),
    reviewedAt: new Date('2025-12-08T15:00:00'),
    rating: 5,
    feedback: 'Fantastische Arbeit! Du hast wirklich einen Unterschied gemacht heute.',
    xpAwarded: 50,
  },

  // ========== RECENTLY REJECTED ==========
  {
    id: 'sub-7',
    challengeId: 'chal-3',
    challengeTitle: 'Lebensmittel sortieren bei der Tafel',
    studentId: 'user-jonas',
    studentName: 'Jonas Hoffmann',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonasBlue',
    studentLevel: 'helper',
    status: 'rejected',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
    caption: 'War kurz da',
    submittedAt: new Date('2025-12-08T11:00:00'),
    reviewedAt: new Date('2025-12-08T15:30:00'),
    feedback:
      'Das Foto zeigt leider nicht die Sortierarbeit bei der Tafel. Bitte reiche ein passendes Foto ein, das dich beim Sortieren zeigt.',
  },

  // ========== OLDER APPROVED SUBMISSIONS ==========
  {
    id: 'sub-8',
    challengeId: 'chal-tafel-3',
    challengeTitle: 'Spenden-Danksagungen schreiben',
    studentId: 'user-sophie',
    studentName: 'Sophie Koch',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieK',
    studentLevel: 'helper',
    status: 'approved',
    proofType: 'text',
    proofText: 'Sehr geehrte Familie Weber,\n\nIhre regelmäßige Geldspende ermöglicht es uns, Kühltransporte für verderbliche Lebensmittel zu organisieren. Dadurch erreichen frisches Obst und Gemüse bedürftige Familien, bevor es verdirbt. Danke von Herzen!\n\nIhre Tafel Rhein-Main',
    submittedAt: new Date('2025-12-07T09:15:00'),
    reviewedAt: new Date('2025-12-07T10:00:00'),
    rating: 5,
    feedback: 'Wunderschön formuliert! Der persönliche Bezug zur Spende ist perfekt.',
    xpAwarded: 30,
  },
  {
    id: 'sub-9',
    challengeId: 'chal-tafel-2',
    challengeTitle: 'Social Media Post für die Tafel',
    studentId: 'user-lena',
    studentName: 'Lena Fischer',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    studentLevel: 'supporter',
    status: 'approved',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    caption: 'Zweiter Post für die Tafel! Die Reichweite wächst 📈 #LebensmittelRetten',
    submittedAt: new Date('2025-12-06T16:30:00'),
    reviewedAt: new Date('2025-12-06T18:45:00'),
    rating: 5,
    feedback: 'Toll, dass du so aktiv bist! Deine Posts erreichen immer mehr Menschen.',
    xpAwarded: 20,
  },
];

// ============================================
// MOCK DASHBOARD STATS
// Aligned with Tafel Rhein-Main challenges
// ============================================

export const MOCK_STATS: DashboardStats = {
  totalChallenges: 5,
  activeChallenges: 4,
  totalParticipants: 49, // Sum of currentParticipants from Tafel challenges (4+28+12+5)
  pendingSubmissions: 4, // Max + Lena + Tim + Marie
  approvalRate: 87,
  totalVolunteerHours: 42.5,
  averageRating: 4.9, // Matches Tafel's rating
};

// ============================================
// WEEKLY DATA FOR CHARTS
// Week leading up to presentation (Dec 5-11, 2025)
// ============================================

export const MOCK_WEEKLY_DATA = [
  { name: 'Fr 05.', date: '2025-12-05', submissions: 12, approved: 10 },
  { name: 'Sa 06.', date: '2025-12-06', submissions: 8, approved: 7 },
  { name: 'So 07.', date: '2025-12-07', submissions: 15, approved: 14 },
  { name: 'Mo 08.', date: '2025-12-08', submissions: 6, approved: 5 },
  { name: 'Di 09.', date: '2025-12-09', submissions: 9, approved: 8 },
  { name: 'Mi 10.', date: '2025-12-10', submissions: 11, approved: 9 },
  { name: 'Do 11.', date: '2025-12-11', submissions: 7, approved: 5 },
];

// ============================================
// COMMUNITY POSTS - NGO promotional posts
// ============================================

// Community Post types
export type CommunityPostType =
  | 'ngo_promotion'       // NGO promotes a challenge
  | 'success_story'       // User shares verified completion story
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
  userLevel?: 'starter' | 'helper' | 'supporter' | 'champion';
  content: string;
  createdAt: Date;
}

// Linked challenge info for posts
export interface LinkedChallengeInfo {
  id: string;
  title: string;
  imageUrl?: string;
  category: 'environment' | 'social' | 'education' | 'health' | 'animals' | 'culture';
  xpReward: number;
  durationMinutes: 5 | 10 | 15 | 30;
}

// Community Post interface
export interface CommunityPost {
  id: string;
  type: CommunityPostType;
  authorType: 'user' | 'organization';
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorLevel?: 'starter' | 'helper' | 'supporter' | 'champion';
  organizationId?: string;
  organizationLogoUrl?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkedChallengeId?: string;
  linkedChallenge?: LinkedChallengeInfo;
  submissionId?: string;
  xpEarned?: number;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  newLevel?: 'starter' | 'helper' | 'supporter' | 'champion';
  teamMemberNames?: string[];
  streakDays?: number;
  likesCount: number;
  userHasLiked: boolean;
  commentsCount: number;
  comments?: CommunityComment[];
  isHighlighted?: boolean;
  isPinned?: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  publishedAt?: Date;
}

// Mock Community Posts for Tafel Rhein-Main e.V. (org-2)
// Aligned with mobile app and Max's investor story
export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-ngo-1',
    type: 'ngo_promotion',
    authorType: 'organization',
    authorId: 'org-2',
    authorName: 'Tafel Rhein-Main e.V.',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    organizationId: 'org-2',
    organizationLogoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    title: '🥕 Wir brauchen euch! Vorweihnachts-Hochbetrieb',
    content: 'Die Vorweihnachtszeit ist unsere intensivste Zeit! Täglich kommen mehr Bedürftige zur Tafel. Wir suchen helfende Hände zum Sortieren von Lebensmitteln. Jede halbe Stunde zählt – und ihr bekommt 50 XP! Kommt vorbei, wir freuen uns auf euch. 💚',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    linkedChallengeId: 'chal-3',
    linkedChallenge: {
      id: 'chal-3',
      title: 'Lebensmittel sortieren bei der Tafel',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      category: 'social',
      xpReward: 50,
      durationMinutes: 30,
    },
    likesCount: 104,
    userHasLiked: false,
    commentsCount: 12,
    comments: [
      {
        id: 'comment-1',
        postId: 'post-ngo-1',
        userId: 'user-lena',
        userName: 'Lena Fischer',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
        userLevel: 'supporter',
        content: 'War gestern da – das Team ist super! Kann ich nur empfehlen 🌱',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'comment-2',
        postId: 'post-ngo-1',
        userId: 'user-1',
        userName: 'Max Mustermann',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxStudent',
        userLevel: 'helper',
        content: 'Perfekt für die Mittagspause! Hab gerade meine Submission hochgeladen 💪',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
    isHighlighted: true,
    isPinned: true,
    status: 'published',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'post-ngo-2',
    type: 'ngo_promotion',
    authorType: 'organization',
    authorId: 'org-2',
    authorName: 'Tafel Rhein-Main e.V.',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    organizationId: 'org-2',
    organizationLogoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    title: '📱 Macht Lebensmittelrettung viral!',
    content: 'Wusstest du, dass in Deutschland jährlich 12 Millionen Tonnen Lebensmittel weggeworfen werden? Hilf uns, das zu ändern! Erstelle einen Social Media Post mit #TafelRettetLebensmittel. Nur 10 Minuten – 20 XP – aber großer Impact!',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    linkedChallengeId: 'chal-tafel-2',
    linkedChallenge: {
      id: 'chal-tafel-2',
      title: 'Social Media Post für die Tafel',
      imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
      category: 'social',
      xpReward: 20,
      durationMinutes: 10,
    },
    likesCount: 86,
    userHasLiked: false,
    commentsCount: 7,
    isHighlighted: false,
    isPinned: false,
    status: 'published',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'post-ngo-draft-1',
    type: 'ngo_promotion',
    authorType: 'organization',
    authorId: 'org-2',
    authorName: 'Tafel Rhein-Main e.V.',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    organizationId: 'org-2',
    organizationLogoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    title: '🎄 Weihnachtspakete packen – Helfer gesucht!',
    content: 'Entwurf: Ab dem 15. Dezember packen wir Weihnachtspakete für bedürftige Familien. Jedes Paket enthält Lebensmittel und kleine Geschenke. Wir brauchen viele helfende Hände! Mehr Infos folgen...',
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800',
    linkedChallengeId: 'chal-draft-tafel',
    linkedChallenge: {
      id: 'chal-draft-tafel',
      title: 'Weihnachtspakete packen (Entwurf)',
      imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400',
      category: 'social',
      xpReward: 50,
      durationMinutes: 30,
    },
    likesCount: 0,
    userHasLiked: false,
    commentsCount: 0,
    isHighlighted: false,
    isPinned: false,
    status: 'draft',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

// Community Stats for Dashboard
export interface CommunityStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
}

export const MOCK_COMMUNITY_STATS: CommunityStats = {
  totalPosts: 3,
  publishedPosts: 2,
  draftPosts: 1,
  totalLikes: 190, // 104 + 86 from published posts
  totalComments: 19,   // 12 + 7 from published posts
  engagementRate: 12.4, // Higher engagement for social cause
};

// Monthly trend data
export const MOCK_MONTHLY_TREND = [
  { month: 'Sep', participants: 45, challenges: 2 },
  { month: 'Okt', participants: 78, challenges: 3 },
  { month: 'Nov', participants: 124, challenges: 4 },
  { month: 'Dez', participants: 167, challenges: 5 },
];

// ============================================
// CATEGORY & STATUS LABELS
// ============================================

export const CATEGORY_LABELS: Record<string, string> = {
  environment: 'Umwelt',
  social: 'Soziales',
  education: 'Bildung',
  health: 'Gesundheit',
  animals: 'Tierschutz',
  culture: 'Kultur',
};

export const CATEGORY_COLORS: Record<string, string> = {
  environment: '#2e6417',
  social: '#db2777',
  education: '#7c3aed',
  health: '#dc2626',
  animals: '#ea580c',
  culture: '#0891b2',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  paused: 'Pausiert',
  completed: 'Abgeschlossen',
  submitted: 'Eingereicht',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Wird geprüft',
  verified: 'Verifiziert',
  rejected: 'Abgelehnt',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: '#f59e0b', // Amber
  verified: '#22c55e', // Green
  rejected: '#ef4444', // Red
};

export const LEVEL_LABELS: Record<string, string> = {
  starter: 'Einsteiger',
  helper: 'Helfer',
  supporter: 'Unterstützer',
  champion: 'Champion',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getPendingSubmissions = (): Submission[] => {
  return MOCK_SUBMISSIONS.filter((s) => s.status === 'submitted');
};

export const getApprovedSubmissions = (): Submission[] => {
  return MOCK_SUBMISSIONS.filter((s) => s.status === 'approved');
};

export const getRejectedSubmissions = (): Submission[] => {
  return MOCK_SUBMISSIONS.filter((s) => s.status === 'rejected');
};

export const getActiveChallenges = (): Challenge[] => {
  return MOCK_CHALLENGES.filter((c) => c.status === 'active');
};

export const getDraftChallenges = (): Challenge[] => {
  return MOCK_CHALLENGES.filter((c) => c.status === 'draft');
};

export const getChallengeById = (id: string): Challenge | undefined => {
  return MOCK_CHALLENGES.find((c) => c.id === id);
};

export const getSubmissionsByChallengeId = (challengeId: string): Submission[] => {
  return MOCK_SUBMISSIONS.filter((s) => s.challengeId === challengeId);
};
