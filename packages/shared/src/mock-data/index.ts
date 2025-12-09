// SolvTerra Mock Data
// Realistic demo data for presentation purposes
// Based on PRD personas and business plan scenarios

import type {
  Organization,
  User,
  Challenge,
  Submission,
  Badge,
  UserBadge,
  OrganizationStats,
  UserStats,
  NgoAdmin,
  FeedItem,
  Friend,
  TeammateSeeker,
  CommunityPost,
  CommunityComment,
  ReactionType,
} from '../types';
import { AVAILABLE_BADGES, XP_BY_DURATION } from '../constants';

// ============================================
// MOCK TEAMMATE SEEKERS (for matchmaking demo)
// ============================================

export const MOCK_TEAMMATE_SEEKERS: TeammateSeeker[] = [
  {
    id: 'seeker-1',
    name: 'Sophie K.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieK',
    level: 'helper',
    joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'seeker-2',
    name: 'Niklas M.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NiklasM',
    level: 'starter',
    joinedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'seeker-3',
    name: 'Elena R.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaR',
    level: 'supporter',
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// ============================================
// MOCK ORGANIZATIONS (German NGOs)
// Based on PRD Personas N1 (Small), N2 (Mid-Size), N3 (Large)
// ============================================

export const MOCK_ORGANIZATIONS: Organization[] = [
  // N1: Small Association - Local environmental group (Sweet Spot: easy to onboard, testimonials)
  {
    id: 'org-1',
    name: 'NABU Ortsgruppe Darmstadt',
    description: 'Die NABU Ortsgruppe Darmstadt setzt sich lokal für den Schutz von Natur und Umwelt ein. Wir engagieren uns für Artenvielfalt, Biotopschutz und Umweltbildung in unserer Region.',
    mission: 'Für Natur und Umwelt in Darmstadt',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NABU&backgroundColor=2e6417',
    website: 'https://nabu-darmstadt.de',
    contactEmail: 'info@nabu-darmstadt.de',
    verified: true,
    ratingAvg: 4.7,
    ratingCount: 89,
    category: 'Umwelt',
    createdAt: new Date('2025-01-15'),
  },
  // N2: Mid-Size NGO - PRIMARY TARGET (Regional welfare organization)
  {
    id: 'org-2',
    name: 'Tafel Rhein-Main e.V.',
    description: 'Die Tafel Rhein-Main sammelt einwandfreie Lebensmittel und verteilt diese an über 15.000 Bedürftige in der Region. Wir sind auf engagierte Helfer angewiesen.',
    mission: 'Lebensmittel retten. Menschen helfen.',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Tafel&backgroundColor=db2777',
    website: 'https://tafel-rheinmain.de',
    contactEmail: 'kontakt@tafel-rheinmain.de',
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 456,
    category: 'Soziales',
    createdAt: new Date('2025-02-01'),
  },
  // N2: Mid-Size NGO - Education focus
  {
    id: 'org-3',
    name: 'Bildungsinitiative Frankfurt',
    description: 'Wir fördern Bildungschancen für Kinder und Jugendliche durch Nachhilfe, Lesepaten und digitale Lernprojekte an 12 Frankfurter Schulen.',
    mission: 'Bildung für alle',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=BIF&backgroundColor=7c3aed',
    website: 'https://bildungsinitiative-frankfurt.de',
    contactEmail: 'info@bildungsinitiative-frankfurt.de',
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 134,
    category: 'Bildung',
    createdAt: new Date('2025-03-10'),
  },
  // N1: Small Association - Animal welfare
  {
    id: 'org-4',
    name: 'Tierheim Darmstadt e.V.',
    description: 'Wir kümmern uns um über 200 herrenlose Tiere und vermitteln sie in liebevolle Zuhause. Unterstütze uns bei der täglichen Pflege!',
    mission: 'Ein Herz für Tiere',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=THD&backgroundColor=ea580c',
    website: 'https://tierheim-darmstadt.de',
    contactEmail: 'info@tierheim-darmstadt.de',
    verified: true,
    ratingAvg: 4.6,
    ratingCount: 156,
    category: 'Tiere',
    createdAt: new Date('2025-04-05'),
  },
  // N3: Large Organization - National humanitarian
  {
    id: 'org-5',
    name: 'Deutsches Rotes Kreuz Hessen',
    description: 'Das DRK Hessen koordiniert humanitäre Hilfe, Rettungsdienste und soziale Arbeit. Mit über 50.000 Ehrenamtlichen sind wir im gesamten Bundesland aktiv.',
    mission: 'Aus Liebe zum Menschen',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DRK&backgroundColor=dc2626',
    website: 'https://drk-hessen.de',
    contactEmail: 'info@drk-hessen.de',
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 512,
    category: 'Gesundheit',
    createdAt: new Date('2025-01-20'),
  },
  // N1: Small Association - Culture
  {
    id: 'org-6',
    name: 'Kulturbrücke Mainz',
    description: 'Wir organisieren interkulturelle Veranstaltungen und fördern den Dialog zwischen Kulturen durch Kunst, Musik und gemeinsame Projekte.',
    mission: 'Kultur verbindet Menschen',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=KBM&backgroundColor=0891b2',
    website: 'https://kulturbruecke-mainz.de',
    contactEmail: 'info@kulturbruecke-mainz.de',
    verified: true,
    ratingAvg: 4.5,
    ratingCount: 67,
    category: 'Kultur',
    createdAt: new Date('2025-05-01'),
  },
  // N2: Mid-Size NGO - Senior care
  {
    id: 'org-7',
    name: 'Seniorenhilfe Rhein-Main e.V.',
    description: 'Wir unterstützen über 2.000 ältere Menschen in der Region dabei, selbstständig und würdevoll zu leben. Unsere Angebote reichen von Besuchsdiensten bis zu digitaler Begleitung.',
    mission: 'Gemeinsam gegen Einsamkeit',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SHRM&backgroundColor=db2777',
    website: 'https://seniorenhilfe-rheinmain.de',
    contactEmail: 'kontakt@seniorenhilfe-rheinmain.de',
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 278,
    category: 'Soziales',
    createdAt: new Date('2025-02-15'),
  },
];

// ============================================
// MOCK CHALLENGES
// ============================================

export const MOCK_CHALLENGES: Challenge[] = [
  // Environment Challenges
  {
    id: 'chal-1',
    organizationId: 'org-1',
    organization: MOCK_ORGANIZATIONS[0],
    title: 'Müllsammelaktion im Park dokumentieren',
    description: 'Hilf uns, den öffentlichen Park sauber zu halten! Sammle Müll und dokumentiere deine Aktion mit Fotos.',
    instructions: '1. Gehe in einen Park in deiner Nähe\n2. Sammle mindestens 10 Minuten lang Müll ein\n3. Mache ein Foto von dem gesammelten Müll\n4. Lade das Foto als Beweis hoch',
    category: 'environment',
    type: 'onsite',
    durationMinutes: 15,
    verificationMethod: 'photo',
    maxParticipants: 50,
    currentParticipants: 23,
    xpReward: 30,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    tags: ['outdoor', 'umwelt', 'müll'],
    // Location - flexible, any park
    location: {
      name: 'Beliebiger Park in deiner Nähe',
      additionalInfo: 'Handschuhe und Müllbeutel mitbringen!',
    },
    // Schedule - anytime
    schedule: {
      type: 'anytime',
      isFlexible: true,
    },
    // Contact
    contact: {
      name: 'Lisa Naturfreund',
      role: 'Umweltkoordinatorin',
      email: 'lisa@nabu-darmstadt.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'chal-2',
    organizationId: 'org-1',
    organization: MOCK_ORGANIZATIONS[0],
    title: 'Social Media Post für Naturschutz erstellen',
    description: 'Erstelle einen kreativen Social Media Post, um auf den Naturschutz aufmerksam zu machen.',
    instructions: '1. Erstelle einen informativen Post über Naturschutz\n2. Verwende den Hashtag #NaturschutzJetzt\n3. Poste auf Instagram, Twitter oder LinkedIn\n4. Mache einen Screenshot und lade ihn hoch',
    category: 'environment',
    type: 'digital',
    durationMinutes: 10,
    verificationMethod: 'photo',
    maxParticipants: 100,
    currentParticipants: 45,
    xpReward: 20,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    tags: ['social-media', 'digital', 'awareness'],
    // Schedule - deadline-based campaign
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      deadline: new Date('2025-12-31'),
      isFlexible: true,
    },
    contact: {
      name: 'Lisa Naturfreund',
      role: 'Social Media Team',
      email: 'social@nabu-darmstadt.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },

  // Social Challenges
  {
    id: 'chal-3',
    organizationId: 'org-2',
    organization: MOCK_ORGANIZATIONS[1],
    title: 'Lebensmittel sortieren bei der Tafel',
    description: 'Hilf uns beim Sortieren von gespendeten Lebensmitteln in unserer Ausgabestelle.',
    instructions: '1. Komme zur Tafel-Ausgabestelle in Frankfurt\n2. Hilf beim Sortieren der Lebensmittel nach Haltbarkeit\n3. Mache ein Foto bei der Arbeit\n4. Lade das Foto hoch',
    category: 'social',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 10,
    currentParticipants: 4,
    xpReward: 50,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
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
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'chal-4',
    organizationId: 'org-7',
    organization: MOCK_ORGANIZATIONS[6],
    title: 'Telefonat mit Senioren führen',
    description: 'Führe ein nettes Telefonat mit einem einsamen Senior oder einer Seniorin. Dein Anruf macht den Unterschied!',
    instructions: '1. Melde dich bei uns an – wir vermitteln dir einen Kontakt\n2. Rufe die zugewiesene Person an und führe ein freundliches Gespräch\n3. Das Gespräch sollte mindestens 15 Minuten dauern\n4. Schreibe uns danach eine kurze Zusammenfassung (2-3 Sätze)',
    category: 'social',
    type: 'digital',
    durationMinutes: 15,
    verificationMethod: 'text',
    maxParticipants: 20,
    currentParticipants: 8,
    xpReward: 30,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?w=400',
    tags: ['telefonat', 'senioren', 'gespräch'],
    schedule: {
      type: 'recurring',
      timeSlots: ['Täglich 10-12 Uhr', 'Täglich 15-18 Uhr'],
      isFlexible: true,
    },
    contact: {
      name: 'Claudia Warmherz',
      role: 'Projektleiterin Besuchsdienst',
      email: 'besuchsdienst@seniorenhilfe-rheinmain.de',
      phone: '+49 69 9876543',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-11-18'),
    updatedAt: new Date('2025-12-01'),
  },

  // Education Challenges
  {
    id: 'chal-5',
    organizationId: 'org-3',
    organization: MOCK_ORGANIZATIONS[2],
    title: 'Kinderbuch-Empfehlungen recherchieren',
    description: 'Recherchiere 5 altersgerechte Kinderbücher für Grundschüler und erstelle eine Empfehlungsliste für unsere Lesepaten.',
    instructions: '1. Recherchiere 5 Kinderbücher für 6-10 Jährige\n2. Achte auf diverse Themen und Autor:innen\n3. Schreibe zu jedem Buch eine kurze Empfehlung (2-3 Sätze)\n4. Reiche deine Liste als Text ein',
    category: 'education',
    type: 'digital',
    durationMinutes: 15,
    verificationMethod: 'text',
    maxParticipants: 30,
    currentParticipants: 12,
    xpReward: 30,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    tags: ['recherche', 'bücher', 'kinder'],
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-15'),
      deadline: new Date('2026-01-15'),
      isFlexible: true,
    },
    contact: {
      name: 'Dr. Sarah Bildung',
      role: 'Projektkoordinatorin Leseförderung',
      email: 'lesefoerderung@bildungsinitiative-frankfurt.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'chal-6',
    organizationId: 'org-3',
    organization: MOCK_ORGANIZATIONS[2],
    title: 'Vorlese-Video aufnehmen',
    description: 'Nimm ein kurzes Video auf, in dem du eine Geschichte für Kinder vorliest. Dein Video wird auf unserer Lernplattform verwendet!',
    instructions: '1. Wähle eine kindgerechte Geschichte aus (max. 5 Minuten)\n2. Achte auf gute Beleuchtung und klaren Ton\n3. Nimm dich beim Vorlesen auf\n4. Lade das Video hoch oder teile einen Google Drive / Dropbox Link',
    category: 'education',
    type: 'digital',
    durationMinutes: 10,
    verificationMethod: 'text',
    maxParticipants: 25,
    currentParticipants: 7,
    xpReward: 20,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    tags: ['video', 'vorlesen', 'kreativ'],
    schedule: {
      type: 'anytime',
      isFlexible: true,
    },
    contact: {
      name: 'Markus Lernfreund',
      role: 'Medienkoordinator',
      email: 'medien@bildungsinitiative-frankfurt.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-11-22'),
    updatedAt: new Date('2025-12-01'),
  },

  // Health Challenges
  {
    id: 'chal-7',
    organizationId: 'org-5',
    organization: MOCK_ORGANIZATIONS[4],
    title: 'Erste-Hilfe-Wissen teilen',
    description: 'Erstelle einen informativen Post über grundlegende Erste-Hilfe-Maßnahmen und erreiche damit deine Community.',
    instructions: '1. Recherchiere grundlegende Erste-Hilfe-Maßnahmen auf unserer Website\n2. Erstelle einen informativen Social-Media-Post (Infografik oder Text)\n3. Teile ihn mit dem Hashtag #ErsteHilfeRettet\n4. Lade einen Screenshot deines Posts hoch',
    category: 'health',
    type: 'digital',
    durationMinutes: 15,
    verificationMethod: 'photo',
    maxParticipants: 50,
    currentParticipants: 18,
    xpReward: 30,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    tags: ['gesundheit', 'erste-hilfe', 'social-media'],
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-31'),
      deadline: new Date('2026-01-31'),
      isFlexible: true,
    },
    contact: {
      name: 'Thomas Rettung',
      role: 'Referent Öffentlichkeitsarbeit',
      email: 'presse@drk-hessen.de',
      phone: '+49 611 5060100',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-12-01'),
  },

  // Animal Challenges
  {
    id: 'chal-8',
    organizationId: 'org-4',
    organization: MOCK_ORGANIZATIONS[3],
    title: 'Tierheim-Tiere auf Social Media vorstellen',
    description: 'Hilf uns, unsere Tiere bekannt zu machen! Teile ein Profil eines unserer Schützlinge und erhöhe die Vermittlungschancen.',
    instructions: '1. Besuche unsere Website www.tierheim-darmstadt.de und wähle ein Tier aus\n2. Erstelle einen ansprechenden Social-Media-Post über das Tier\n3. Beschreibe Charakter und Besonderheiten\n4. Teile den Post mit #TierheimDarmstadt und lade einen Screenshot hoch',
    category: 'animals',
    type: 'digital',
    durationMinutes: 10,
    verificationMethod: 'photo',
    maxParticipants: 40,
    currentParticipants: 15,
    xpReward: 20,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    tags: ['tiere', 'social-media', 'adoption'],
    schedule: {
      type: 'anytime',
      isFlexible: true,
    },
    contact: {
      name: 'Julia Tierlieb',
      role: 'Vermittlungskoordinatorin',
      email: 'vermittlung@tierheim-darmstadt.de',
      phone: '+49 6151 52523',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-11-28'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'chal-9',
    organizationId: 'org-4',
    organization: MOCK_ORGANIZATIONS[3],
    title: 'Hundespaziergang im Tierheim',
    description: 'Geh mit einem unserer Hunde spazieren und schenke ihm Aufmerksamkeit. Die Hunde freuen sich riesig über Abwechslung!',
    instructions: '1. Komme zum Tierheim Darmstadt\n2. Melde dich am Empfang für einen Hundespaziergang an\n3. Unsere Mitarbeiter:innen teilen dir einen passenden Hund zu\n4. Gehe mindestens 20 Minuten mit dem Hund spazieren\n5. Mache ein Foto während des Spaziergangs',
    category: 'animals',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 8,
    currentParticipants: 3,
    xpReward: 50,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    tags: ['vor-ort', 'hunde', 'bewegung'],
    location: {
      name: 'Tierheim Darmstadt',
      address: 'Eschollbrücker Straße 100, 64295 Darmstadt',
      meetingPoint: 'Empfang im Hauptgebäude',
      additionalInfo: 'Festes Schuhwerk empfohlen. Hunde werden vom Personal zugeteilt.',
      coordinates: { lat: 49.8498, lng: 8.6264 },
    },
    schedule: {
      type: 'recurring',
      timeSlots: ['Di-Fr: 14-17 Uhr', 'Sa-So: 10-16 Uhr'],
      isFlexible: false,
    },
    contact: {
      name: 'Peter Hundefreund',
      role: 'Hundebetreuer',
      email: 'hunde@tierheim-darmstadt.de',
      phone: '+49 6151 52523',
      preferredMethod: 'phone',
      responseTime: 'Sofort während Öffnungszeiten',
    },
    createdAt: new Date('2025-11-30'),
    updatedAt: new Date('2025-12-01'),
  },

  // Culture Challenges
  {
    id: 'chal-10',
    organizationId: 'org-6',
    organization: MOCK_ORGANIZATIONS[5],
    title: 'Kulturveranstaltung dokumentieren',
    description: 'Dokumentiere eine kulturelle Veranstaltung in deiner Stadt mit Fotos für unseren Blog und Social Media.',
    instructions: '1. Besuche eine kulturelle Veranstaltung (Museum, Konzert, Theater, Ausstellung)\n2. Mache 3-5 hochwertige Fotos von der Veranstaltung\n3. Achte auf gute Bildkomposition und Beleuchtung\n4. Lade dein bestes Foto mit kurzer Beschreibung hoch',
    category: 'culture',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 25,
    currentParticipants: 9,
    xpReward: 50,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    tags: ['kultur', 'fotos', 'veranstaltung'],
    location: {
      name: 'Beliebige Kulturveranstaltung in der Region',
      additionalInfo: 'Museen, Theater, Konzerte, Ausstellungen – alles ist willkommen!',
    },
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-02-28'),
      deadline: new Date('2026-02-28'),
      isFlexible: true,
    },
    contact: {
      name: 'Amir Kulturbrücke',
      role: 'Projektleiter Kulturvermittlung',
      email: 'projekte@kulturbruecke-mainz.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },

  // Quick 5-minute challenges
  {
    id: 'chal-11',
    organizationId: 'org-1',
    organization: MOCK_ORGANIZATIONS[0],
    title: 'Umwelt-Umfrage ausfüllen',
    description: 'Fülle unsere kurze Umfrage zum Umweltbewusstsein aus. Deine Antworten helfen uns bei der Planung neuer Projekte!',
    instructions: '1. Klicke auf den Umfrage-Link in unserer App\n2. Beantworte alle 8 Fragen ehrlich (ca. 5 Min)\n3. Sende uns die Bestätigungsnummer als Text',
    category: 'environment',
    type: 'digital',
    durationMinutes: 5,
    verificationMethod: 'text',
    maxParticipants: 200,
    currentParticipants: 87,
    xpReward: 10,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    tags: ['umfrage', 'schnell', 'digital'],
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-31'),
      deadline: new Date('2026-01-31'),
      isFlexible: true,
    },
    contact: {
      name: 'Lisa Naturfreund',
      role: 'Umweltkoordinatorin',
      email: 'umfrage@nabu-darmstadt.de',
      preferredMethod: 'email',
      responseTime: 'Automatische Bestätigung',
    },
    createdAt: new Date('2025-12-02'),
    updatedAt: new Date('2025-12-02'),
  },
  {
    id: 'chal-12',
    organizationId: 'org-5',
    organization: MOCK_ORGANIZATIONS[4],
    title: 'Blutspende-Info teilen',
    description: 'Teile Informationen über Blutspende in deinem sozialen Umfeld. Jeder Beitrag kann Leben retten!',
    instructions: '1. Informiere dich auf www.drk-blutspende.de über Blutspende\n2. Teile den Info-Beitrag in deinen sozialen Medien oder WhatsApp\n3. Schreibe dazu, warum Blutspenden wichtig ist\n4. Mache einen Screenshot und lade ihn hoch',
    category: 'health',
    type: 'digital',
    durationMinutes: 5,
    verificationMethod: 'photo',
    maxParticipants: 150,
    currentParticipants: 62,
    xpReward: 10,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400',
    tags: ['blutspende', 'teilen', 'schnell'],
    schedule: {
      type: 'anytime',
      isFlexible: true,
    },
    contact: {
      name: 'Dr. Karin Blutspende',
      role: 'Leiterin Spenderwerbung',
      email: 'blutspende@drk-hessen.de',
      phone: '+49 611 5060200',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-12-03'),
    updatedAt: new Date('2025-12-03'),
  },

  // ============================================
  // MULTI-PERSON / TEAM CHALLENGES
  // Showcasing the social USP - 62% would help more with friends
  // ============================================
  {
    id: 'chal-team-1',
    organizationId: 'org-1',
    organization: MOCK_ORGANIZATIONS[0],
    title: 'Gemeinsame Müllsammelaktion',
    description: 'Sammelt gemeinsam als Team Müll im Herrngarten Darmstadt. Zusammen schafft ihr mehr und habt dabei Spaß!',
    instructions: '1. Bildet ein Team von 2-4 Personen\n2. Trefft euch am großen Springbrunnen im Herrngarten\n3. Sammelt 30 Minuten gemeinsam Müll\n4. Handschuhe und Müllbeutel werden vor Ort gestellt\n5. Macht ein Gruppenfoto mit dem gesammelten Müll\n6. Ladet das Foto zusammen hoch',
    category: 'environment',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 40,
    currentParticipants: 12,
    xpReward: 75,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=400',
    tags: ['team', 'outdoor', 'umwelt'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    teamDescription: 'Lade Freunde ein oder finde neue Teammitglieder über unsere Matching-Funktion!',
    allowSoloJoin: true,
    teammateSeekers: MOCK_TEAMMATE_SEEKERS.slice(0, 2),
    location: {
      name: 'Herrngarten Darmstadt',
      address: 'Herrngarten, 64283 Darmstadt',
      meetingPoint: 'Am großen Springbrunnen (Nordseite)',
      additionalInfo: 'Handschuhe und Müllbeutel werden gestellt. Bitte wetterfeste Kleidung tragen.',
      coordinates: { lat: 49.8728, lng: 8.6512 },
    },
    schedule: {
      type: 'fixed',
      startDate: new Date('2025-12-13T10:00:00'),
      endDate: new Date('2025-12-13T11:00:00'),
      isFlexible: false,
    },
    contact: {
      name: 'Lisa Naturfreund',
      role: 'Aktionsleitung',
      email: 'aktionen@nabu-darmstadt.de',
      phone: '+49 6151 987654',
      preferredMethod: 'app',
      responseTime: 'Innerhalb von 2 Stunden',
    },
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'chal-team-2',
    organizationId: 'org-3',
    organization: MOCK_ORGANIZATIONS[2],
    title: 'Team-Recherche: Bildungsmaterialien',
    description: 'Recherchiert als Team kostenlose Lernressourcen für Grundschüler. Eure Ergebnisse helfen Kindern beim Lernen!',
    instructions: '1. Bildet ein Team von 2-3 Personen\n2. Teilt die Recherche nach Fächern auf (Mathe, Deutsch, Sachkunde)\n3. Findet mindestens 10 kostenlose Online-Lernressourcen\n4. Bewertet jede Ressource kurz (Altersgruppe, Qualität)\n5. Erstellt gemeinsam eine strukturierte Liste\n6. Reicht die Liste als Text oder Google Doc Link ein',
    category: 'education',
    type: 'digital',
    durationMinutes: 15,
    verificationMethod: 'text',
    maxParticipants: 30,
    currentParticipants: 6,
    xpReward: 45,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    tags: ['team', 'recherche', 'bildung'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 3,
    teamDescription: 'Gemeinsam recherchiert es sich besser! Teilt euch die Fächer auf.',
    allowSoloJoin: true,
    teammateSeekers: [MOCK_TEAMMATE_SEEKERS[2]],
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-15'),
      deadline: new Date('2026-01-15'),
      isFlexible: true,
    },
    contact: {
      name: 'Dr. Sarah Bildung',
      role: 'Projektkoordinatorin',
      email: 'projekte@bildungsinitiative-frankfurt.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-12-02'),
    updatedAt: new Date('2025-12-02'),
  },
  {
    id: 'chal-team-3',
    organizationId: 'org-2',
    organization: MOCK_ORGANIZATIONS[1],
    title: 'Flyer verteilen im Team',
    description: 'Verteilt als Gruppe Flyer für die Tafel in Frankfurt-Nordend. Mit mehr Leuten erreicht ihr mehr Menschen!',
    instructions: '1. Bildet ein Team von 2-5 Personen\n2. Holt die Flyer bei der Tafel in Bockenheim ab (Leipziger Str. 45)\n3. Verteilt sie im Gebiet Frankfurt-Nordend (Karte wird bereitgestellt)\n4. Macht Fotos während der Verteilung\n5. Ladet ein Gruppenfoto hoch',
    category: 'social',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 25,
    currentParticipants: 5,
    xpReward: 60,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
    tags: ['team', 'vor-ort', 'flyer'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 5,
    teamDescription: 'Mit mehr Leuten erreicht ihr mehr Menschen! Lade Freunde ein.',
    allowSoloJoin: true,
    teammateSeekers: MOCK_TEAMMATE_SEEKERS.slice(1, 3),
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
    createdAt: new Date('2025-12-03'),
    updatedAt: new Date('2025-12-03'),
  },
  {
    id: 'chal-team-4',
    organizationId: 'org-6',
    organization: MOCK_ORGANIZATIONS[5],
    title: 'Interkulturelles Kochevent dokumentieren',
    description: 'Organisiert ein kleines interkulturelles Kochevent und dokumentiert es für unseren Blog. Feiert Vielfalt gemeinsam!',
    instructions: '1. Bildet ein Team von 3-4 Personen aus verschiedenen Kulturen\n2. Kocht gemeinsam ein traditionelles Gericht aus einer eurer Kulturen\n3. Dokumentiert das Event mit mind. 5 Fotos (Zutaten, Kochen, fertiges Gericht, Gruppe)\n4. Schreibt eine kurze Beschreibung des Rezepts und der kulturellen Bedeutung\n5. Erstellt einen Social-Media-Beitrag mit #KulturbrückeMainz\n6. Teilt den Beitrag und ladet Screenshots + Fotos hoch',
    category: 'culture',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 20,
    currentParticipants: 8,
    xpReward: 70,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    tags: ['team', 'kultur', 'kochen', 'interkulturell'],
    isMultiPerson: true,
    minTeamSize: 3,
    maxTeamSize: 4,
    teamDescription: 'Feiert Vielfalt gemeinsam! Findet Teammitglieder aus verschiedenen Kulturen.',
    allowSoloJoin: true,
    teammateSeekers: MOCK_TEAMMATE_SEEKERS,
    location: {
      name: 'Eigene Küche oder Gemeinschaftsraum',
      additionalInfo: 'Ihr organisiert den Ort selbst. Tipp: Nutzt studentische Gemeinschaftsküchen oder trefft euch privat.',
    },
    schedule: {
      type: 'range',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-02-28'),
      deadline: new Date('2026-02-28'),
      isFlexible: true,
    },
    contact: {
      name: 'Amir Kulturbrücke',
      role: 'Projektleiter Interkulturelle Begegnungen',
      email: 'interkulturell@kulturbruecke-mainz.de',
      preferredMethod: 'email',
      responseTime: 'Innerhalb von 48 Stunden',
    },
    createdAt: new Date('2025-12-04'),
    updatedAt: new Date('2025-12-04'),
  },
  {
    id: 'chal-team-5',
    organizationId: 'org-5',
    organization: MOCK_ORGANIZATIONS[4],
    title: 'Erste-Hilfe-Kurs-Begleitung',
    description: 'Begleitet als Team einen Erste-Hilfe-Kurs und unterstützt die Kursleiter bei praktischen Übungen.',
    instructions: '1. Bildet ein Team von 2-3 Personen\n2. Meldet euch für einen Kurstermin an (siehe Zeitslots)\n3. Unterstützt die Kursleiter bei der Vorbereitung und den Übungen\n4. Betreut die Teilnehmer während der praktischen Einheiten\n5. Macht Fotos (mit Einverständnis) und ladet sie hoch',
    category: 'health',
    type: 'onsite',
    durationMinutes: 30,
    verificationMethod: 'photo',
    maxParticipants: 15,
    currentParticipants: 3,
    xpReward: 65,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    tags: ['team', 'gesundheit', 'erste-hilfe', 'kurs'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 3,
    teamDescription: 'Gemeinsam lernt ihr auch etwas dabei! Ideal für Studierende mit Interesse an Medizin.',
    allowSoloJoin: true,
    teammateSeekers: [MOCK_TEAMMATE_SEEKERS[0]],
    location: {
      name: 'DRK Schulungszentrum Wiesbaden',
      address: 'Abraham-Lincoln-Straße 7, 65189 Wiesbaden',
      meetingPoint: 'Eingang Schulungszentrum, Anmeldung',
      additionalInfo: 'Bequeme Kleidung tragen. Keine Vorkenntnisse erforderlich.',
      coordinates: { lat: 50.0782, lng: 8.2397 },
    },
    schedule: {
      type: 'recurring',
      timeSlots: ['Sa: 9-12 Uhr (Grundkurs)', 'Sa: 14-17 Uhr (Auffrischung)'],
      deadline: new Date('2026-03-31'),
      isFlexible: false,
    },
    contact: {
      name: 'Thomas Rettung',
      role: 'Ausbildungsleiter',
      email: 'ausbildung@drk-hessen.de',
      phone: '+49 611 5060100',
      preferredMethod: 'phone',
      responseTime: 'Innerhalb von 24 Stunden',
    },
    createdAt: new Date('2025-12-05'),
    updatedAt: new Date('2025-12-05'),
  },
];

// ============================================
// MOCK USERS - Based on PRD Student Personas
// ============================================

// S1: "The Time-Pressed" - Max, 24, Master's Business Informatics, Darmstadt
// Primary demo user - represents 50% of target audience
export const MOCK_USER: User = {
  id: 'user-max',
  email: 'max.mustermann@student.tu-darmstadt.de',
  name: 'Max Mustermann',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
  bio: 'Master Wirtschaftsinformatik @ TU Darmstadt | 15h Werkstudent | Helfe in kleinen Zeitfenstern 🌱',
  interests: ['environment', 'education', 'health'],
  xpTotal: 280,
  level: 'helper',
  completedChallenges: 12,
  hoursContributed: 3.5,
  badges: [
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'first-challenge')!,
      earnedAt: new Date('2025-11-05'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'five-challenges')!,
      earnedAt: new Date('2025-11-15'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'ten-challenges')!,
      earnedAt: new Date('2025-11-28'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'eco-warrior')!,
      earnedAt: new Date('2025-11-25'),
    },
  ],
  savedChallengeIds: ['chal-3', 'chal-9'],
  createdAt: new Date('2025-11-01'),
  onboardingCompleted: true,
};

// S2: "The Social Helper" - Lena, 22, Bachelor's Social Work, Frankfurt
// Represents users who want to help with friends (30% of target)
export const MOCK_USER_LENA: User = {
  id: 'user-lena',
  email: 'lena.fischer@student.uni-frankfurt.de',
  name: 'Lena Fischer',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
  bio: 'Soziale Arbeit @ Goethe-Uni | Engagement macht zusammen mehr Spaß! 💜',
  interests: ['social', 'education', 'culture'],
  xpTotal: 520,
  level: 'supporter',
  completedChallenges: 18,
  hoursContributed: 6.5,
  badges: [
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'first-challenge')!,
      earnedAt: new Date('2025-10-20'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'five-challenges')!,
      earnedAt: new Date('2025-11-01'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'ten-challenges')!,
      earnedAt: new Date('2025-11-15'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'social-butterfly')!,
      earnedAt: new Date('2025-11-20'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'week-streak')!,
      earnedAt: new Date('2025-11-25'),
    },
  ],
  savedChallengeIds: ['chal-4', 'chal-10'],
  createdAt: new Date('2025-10-15'),
  onboardingCompleted: true,
};

// S3: "The Achievement Hunter" - Tim, 21, Bachelor's Computer Science, Munich
// Represents gamification-motivated users (20% of target)
export const MOCK_USER_TIM: User = {
  id: 'user-tim',
  email: 'tim.weber@student.tum.de',
  name: 'Tim Weber',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
  bio: 'Informatik @ TUM | Collector of badges 🏆 | Level-up enthusiast',
  interests: ['environment', 'health', 'education'],
  xpTotal: 1850,
  level: 'supporter',
  completedChallenges: 45,
  hoursContributed: 15.0,
  badges: [
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'first-challenge')!,
      earnedAt: new Date('2025-09-15'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'five-challenges')!,
      earnedAt: new Date('2025-09-25'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'ten-challenges')!,
      earnedAt: new Date('2025-10-10'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'twentyfive-challenges')!,
      earnedAt: new Date('2025-11-01'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'eco-warrior')!,
      earnedAt: new Date('2025-10-20'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'health-hero')!,
      earnedAt: new Date('2025-11-10'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'week-streak')!,
      earnedAt: new Date('2025-10-28'),
    },
    {
      badge: AVAILABLE_BADGES.find((b) => b.id === 'early-bird')!,
      earnedAt: new Date('2025-11-05'),
    },
  ],
  savedChallengeIds: [],
  createdAt: new Date('2025-09-10'),
  onboardingCompleted: true,
};

// Fresh user for onboarding demo
export const MOCK_NEW_USER: User = {
  id: 'user-new',
  email: '',
  name: '',
  interests: [],
  xpTotal: 0,
  level: 'starter',
  completedChallenges: 0,
  hoursContributed: 0,
  badges: [],
  savedChallengeIds: [],
  createdAt: new Date(),
  onboardingCompleted: false,
};

// All demo users array for easy access
export const ALL_DEMO_USERS: User[] = [MOCK_USER, MOCK_USER_LENA, MOCK_USER_TIM];

// ============================================
// MOCK USER STATS
// ============================================

export const MOCK_USER_STATS: UserStats = {
  totalChallenges: 15,
  completedChallenges: 12,
  totalXp: 280,
  level: 'helper',
  hoursContributed: 3.5,
  badgesEarned: 4,
  ngosSupported: 5,
  currentStreak: 3,
  longestStreak: 7,
  challengesByCategory: {
    environment: 5,
    social: 3,
    education: 2,
    health: 1,
    animals: 1,
    culture: 0,
    other: 0,
  },
};

// ============================================
// MOCK SUBMISSIONS (for User)
// ============================================

export const MOCK_USER_SUBMISSIONS: Submission[] = [
  // In Progress
  {
    id: 'sub-1',
    challengeId: 'chal-1',
    challenge: MOCK_CHALLENGES[0],
    userId: 'user-1',
    userName: 'Max Mustermann',
    status: 'in_progress',
    proofType: 'photo',
    createdAt: new Date('2025-12-10'),
  },
  // Submitted (pending review)
  {
    id: 'sub-2',
    challengeId: 'chal-2',
    challenge: MOCK_CHALLENGES[1],
    userId: 'user-1',
    userName: 'Max Mustermann',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    caption: 'Mein Naturschutz-Post auf Instagram!',
    submittedAt: new Date('2025-12-09'),
    createdAt: new Date('2025-12-09'),
  },
  // Approved
  {
    id: 'sub-3',
    challengeId: 'chal-5',
    challenge: MOCK_CHALLENGES[4],
    userId: 'user-1',
    userName: 'Max Mustermann',
    status: 'approved',
    proofType: 'text',
    proofText: 'Hier sind meine 5 Buchempfehlungen:\n\n1. "Der kleine Wassermann" von Otfried Preußler\n2. "Momo" von Michael Ende\n3. "Die unendliche Geschichte" von Michael Ende\n4. "Emil und die Detektive" von Erich Kästner\n5. "Jim Knopf und Lukas der Lokomotivführer" von Michael Ende',
    submittedAt: new Date('2025-12-06'),
    reviewedAt: new Date('2025-12-07'),
    ngoRating: 5,
    ngoFeedback: 'Tolle Auswahl! Vielen Dank für die ausführlichen Empfehlungen.',
    xpEarned: 30,
    createdAt: new Date('2025-12-06'),
  },
];

// ============================================
// MOCK NGO ADMIN
// ============================================

export const MOCK_NGO_ADMIN: NgoAdmin = {
  id: 'admin-1',
  email: 'anna.schmidt@nabu.de',
  name: 'Anna Schmidt',
  organizationId: 'org-1',
  role: 'admin',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
  createdAt: new Date('2025-01-15'),
};

// ============================================
// MOCK SUBMISSIONS (for NGO Review Queue)
// Using PRD persona names for consistency
// ============================================

export const MOCK_NGO_SUBMISSIONS: Submission[] = [
  {
    id: 'ngo-sub-1',
    challengeId: 'chal-1',
    challenge: MOCK_CHALLENGES[0],
    userId: 'user-lena',
    userName: 'Lena Fischer',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    caption: 'Mit meinen Freundinnen zusammen Müll gesammelt im Herrngarten! 🌿',
    submittedAt: new Date('2025-12-11T10:30:00'),
    createdAt: new Date('2025-12-11'),
  },
  {
    id: 'ngo-sub-2',
    challengeId: 'chal-2',
    challenge: MOCK_CHALLENGES[1],
    userId: 'user-tim',
    userName: 'Tim Weber',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    caption: 'Mein Instagram Post mit über 200 Likes! Challenge #15 für diesen Monat 🏆',
    submittedAt: new Date('2025-12-11T09:15:00'),
    createdAt: new Date('2025-12-11'),
  },
  {
    id: 'ngo-sub-3',
    challengeId: 'chal-1',
    challenge: MOCK_CHALLENGES[0],
    userId: 'user-max',
    userName: 'Max Mustermann',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
    status: 'submitted',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    caption: 'Schnelle 15-Minuten-Aktion in der Mittagspause!',
    submittedAt: new Date('2025-12-10T16:45:00'),
    createdAt: new Date('2025-12-10'),
  },
  {
    id: 'ngo-sub-4',
    challengeId: 'chal-2',
    challenge: MOCK_CHALLENGES[1],
    userId: 'user-anna',
    userName: 'Anna Schneider',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    status: 'approved',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400',
    submittedAt: new Date('2025-12-09T14:20:00'),
    reviewedAt: new Date('2025-12-09T18:00:00'),
    ngoRating: 5,
    ngoFeedback: 'Super kreativer Post! Vielen Dank für dein Engagement.',
    xpEarned: 20,
    createdAt: new Date('2025-12-09'),
  },
  {
    id: 'ngo-sub-5',
    challengeId: 'chal-1',
    challenge: MOCK_CHALLENGES[0],
    userId: 'user-jonas',
    userName: 'Jonas Hoffmann',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonasBlue',
    status: 'rejected',
    proofType: 'photo',
    proofUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    submittedAt: new Date('2025-12-08T11:00:00'),
    reviewedAt: new Date('2025-12-08T15:30:00'),
    ngoFeedback: 'Das Foto zeigt leider nicht die Müllsammelaktion. Bitte reiche ein passendes Foto ein.',
    createdAt: new Date('2025-12-08'),
  },
];

// ============================================
// MOCK ORGANIZATION STATS
// ============================================

export const MOCK_ORG_STATS: OrganizationStats = {
  totalChallenges: 8,
  activeChallenges: 5,
  completedChallenges: 3,
  pendingSubmissions: 3,
  approvedSubmissions: 45,
  rejectedSubmissions: 5,
  totalVolunteerHours: 67.5,
  averageRating: 4.7,
  totalParticipants: 156,
  weeklyData: [
    { date: '2025-12-05', submissions: 12, approvals: 10 },
    { date: '2025-12-06', submissions: 8, approvals: 7 },
    { date: '2025-12-07', submissions: 15, approvals: 14 },
    { date: '2025-12-08', submissions: 6, approvals: 5 },
    { date: '2025-12-09', submissions: 9, approvals: 8 },
    { date: '2025-12-10', submissions: 11, approvals: 9 },
    { date: '2025-12-11', submissions: 7, approvals: 5 },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getChallengeById = (id: string): Challenge | undefined => {
  return MOCK_CHALLENGES.find((c) => c.id === id);
};

export const getOrganizationById = (id: string): Organization | undefined => {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id);
};

export const getChallengesByOrganization = (orgId: string): Challenge[] => {
  return MOCK_CHALLENGES.filter((c) => c.organizationId === orgId);
};

export const getActiveChallenges = (): Challenge[] => {
  return MOCK_CHALLENGES.filter((c) => c.status === 'active');
};

export const filterChallenges = (
  challenges: Challenge[],
  filters: {
    categories?: string[];
    durations?: number[];
    types?: string[];
  }
): Challenge[] => {
  return challenges.filter((c) => {
    if (filters.categories?.length && !filters.categories.includes(c.category)) {
      return false;
    }
    if (filters.durations?.length && !filters.durations.includes(c.durationMinutes)) {
      return false;
    }
    if (filters.types?.length && !filters.types.includes(c.type)) {
      return false;
    }
    return true;
  });
};

// ============================================
// MOCK FRIENDS (for Team Challenge Invites)
// ============================================

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-lena',
    name: 'Lena Fischer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    level: 'supporter',
    xpTotal: 520,
    isFriend: true,
  },
  {
    id: 'friend-tim',
    name: 'Tim Weber',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    level: 'supporter',
    xpTotal: 1850,
    isFriend: true,
  },
  {
    id: 'friend-anna',
    name: 'Anna Schneider',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    level: 'helper',
    xpTotal: 340,
    isFriend: true,
  },
  {
    id: 'friend-jonas',
    name: 'Jonas Hoffmann',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonasBlue',
    level: 'helper',
    xpTotal: 180,
    isFriend: true,
  },
  {
    id: 'friend-marie',
    name: 'Marie Becker',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariePink',
    level: 'starter',
    xpTotal: 60,
    isFriend: true,
  },
  {
    id: 'friend-felix',
    name: 'Felix Braun',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FelixGreen',
    level: 'helper',
    xpTotal: 250,
    isFriend: true,
  },
];

// ============================================
// MOCK COMMUNITY FEED
// ============================================

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: 'feed-1',
    type: 'challenge_completed',
    userId: 'user-lena',
    userName: 'Lena Fischer',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    userLevel: 'supporter',
    challengeId: 'chal-3',
    challengeTitle: 'Lebensmittel sortieren bei der Tafel',
    challengeImageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
    likesCount: 12,
    isLiked: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'feed-2',
    type: 'badge_earned',
    userId: 'user-tim',
    userName: 'Tim Weber',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    userLevel: 'supporter',
    badgeId: 'twentyfive-challenges',
    badgeName: 'Dedicated Helper',
    badgeIcon: 'award',
    likesCount: 24,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'feed-3',
    type: 'team_challenge',
    userId: 'user-anna',
    userName: 'Anna & Team',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    userLevel: 'helper',
    challengeId: 'chal-team-1',
    challengeTitle: 'Gemeinsame Müllsammelaktion',
    challengeImageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=400',
    teamMemberNames: ['Anna', 'Jonas', 'Marie'],
    likesCount: 18,
    isLiked: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 'feed-4',
    type: 'level_up',
    userId: 'user-max',
    userName: 'Max Mustermann',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
    userLevel: 'helper',
    newLevel: 'helper',
    likesCount: 15,
    isLiked: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'feed-5',
    type: 'challenge_completed',
    userId: 'user-jonas',
    userName: 'Jonas Hoffmann',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonasBlue',
    userLevel: 'helper',
    challengeId: 'chal-8',
    challengeTitle: 'Tierheim-Tiere auf Social Media vorstellen',
    challengeImageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    likesCount: 22,
    isLiked: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: 'feed-6',
    type: 'streak_achieved',
    userId: 'user-lena',
    userName: 'Lena Fischer',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    userLevel: 'supporter',
    streakDays: 7,
    likesCount: 31,
    isLiked: true,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
  },
  {
    id: 'feed-7',
    type: 'challenge_completed',
    userId: 'user-marie',
    userName: 'Marie Becker',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariePink',
    userLevel: 'starter',
    challengeId: 'chal-11',
    challengeTitle: 'Umwelt-Umfrage ausfüllen',
    challengeImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    likesCount: 8,
    isLiked: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: 'feed-8',
    type: 'badge_earned',
    userId: 'user-anna',
    userName: 'Anna Schneider',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    userLevel: 'helper',
    badgeId: 'first-challenge',
    badgeName: 'First Steps',
    badgeIcon: 'rocket',
    likesCount: 14,
    isLiked: false,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
  },
  {
    id: 'feed-9',
    type: 'team_challenge',
    userId: 'user-felix',
    userName: 'Felix & Team',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FelixGreen',
    userLevel: 'helper',
    challengeId: 'chal-team-2',
    challengeTitle: 'Team-Recherche: Bildungsmaterialien',
    challengeImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    teamMemberNames: ['Felix', 'Tim'],
    likesCount: 11,
    isLiked: false,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
  },
  {
    id: 'feed-10',
    type: 'challenge_completed',
    userId: 'user-tim',
    userName: 'Tim Weber',
    userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    userLevel: 'supporter',
    challengeId: 'chal-7',
    challengeTitle: 'Erste-Hilfe-Wissen teilen',
    challengeImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    likesCount: 19,
    isLiked: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  },
];

// ============================================
// MOCK COMMUNITY POSTS (Enhanced Feed)
// ============================================

// Default empty reactions helper
const emptyReactions = (): Record<ReactionType, number> => ({
  heart: 0,
  celebrate: 0,
  inspiring: 0,
  thanks: 0,
});

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  // ============================================
  // NGO PROMOTIONAL POSTS - Challenge Promotions
  // ============================================
  {
    id: 'post-ngo-1',
    type: 'ngo_promotion',
    authorType: 'organization',
    authorId: 'org-1',
    authorName: 'NABU Ortsgruppe Darmstadt',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NABU&backgroundColor=2e6417',
    organizationId: 'org-1',
    organizationLogoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=NABU&backgroundColor=2e6417',
    title: '🌿 Gemeinsam für saubere Parks!',
    content: 'Am Samstag findet unsere große Team-Müllsammelaktion im Herrngarten statt! Kommt vorbei, bringt Freunde mit und helft uns, Darmstadt sauberer zu machen. Handschuhe und Müllbeutel werden gestellt. Jedes Team erhält 75 XP!',
    imageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=800',
    linkedChallengeId: 'chal-team-1',
    linkedChallenge: {
      id: 'chal-team-1',
      title: 'Gemeinsame Müllsammelaktion',
      imageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=400',
      organizationName: 'NABU Ortsgruppe Darmstadt',
      category: 'environment',
      xpReward: 75,
      durationMinutes: 30,
    },
    reactions: { heart: 24, celebrate: 18, inspiring: 12, thanks: 8 },
    totalReactions: 62,
    commentsCount: 8,
    comments: [
      {
        id: 'comment-1',
        postId: 'post-ngo-1',
        userId: 'user-lena',
        userName: 'Lena Fischer',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
        userLevel: 'supporter',
        content: 'Super Initiative! Wer hat noch Lust, zusammen hinzugehen? 🌱',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'comment-2',
        postId: 'post-ngo-1',
        userId: 'user-max',
        userName: 'Max Mustermann',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
        userLevel: 'helper',
        content: 'Bin dabei! Hab mich schon angemeldet 💪',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
    isHighlighted: true,
    isPinned: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
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
    title: '❤️ Wir brauchen eure Hilfe!',
    content: 'Die Vorweihnachtszeit ist unsere arbeitsreichste Zeit. Täglich kommen mehr Menschen zur Ausgabe, und wir brauchen dringend Unterstützung beim Sortieren der Lebensmittel. Schon 30 Minuten machen einen Unterschied!',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    linkedChallengeId: 'chal-3',
    linkedChallenge: {
      id: 'chal-3',
      title: 'Lebensmittel sortieren bei der Tafel',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      organizationName: 'Tafel Rhein-Main e.V.',
      category: 'social',
      xpReward: 50,
      durationMinutes: 30,
    },
    reactions: { heart: 45, celebrate: 12, inspiring: 28, thanks: 34 },
    totalReactions: 119,
    commentsCount: 15,
    comments: [
      {
        id: 'comment-3',
        postId: 'post-ngo-2',
        userId: 'user-anna',
        userName: 'Anna Schneider',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
        userLevel: 'helper',
        content: 'War letzte Woche da - total schöne Erfahrung! Das Team ist super nett.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
    isHighlighted: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'post-ngo-3',
    type: 'ngo_promotion',
    authorType: 'organization',
    authorId: 'org-7',
    authorName: 'Seniorenhilfe Rhein-Main e.V.',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SHRM&backgroundColor=db2777',
    organizationId: 'org-7',
    organizationLogoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SHRM&backgroundColor=db2777',
    title: '📞 Ein Anruf, der den Tag verändert',
    content: 'Viele ältere Menschen in unserer Region fühlen sich einsam. Mit einem 15-minütigen Telefonat kannst du den Tag eines Menschen aufhellen. Keine Vorkenntnisse nötig - nur ein offenes Ohr und etwas Zeit.',
    imageUrl: 'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?w=800',
    linkedChallengeId: 'chal-4',
    linkedChallenge: {
      id: 'chal-4',
      title: 'Telefonat mit Senioren führen',
      imageUrl: 'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?w=400',
      organizationName: 'Seniorenhilfe Rhein-Main e.V.',
      category: 'social',
      xpReward: 30,
      durationMinutes: 15,
    },
    reactions: { heart: 67, celebrate: 8, inspiring: 42, thanks: 51 },
    totalReactions: 168,
    commentsCount: 22,
    isHighlighted: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },

  // ============================================
  // SUCCESS STORIES - User-generated after verified completion
  // ============================================
  {
    id: 'post-success-1',
    type: 'success_story',
    authorType: 'user',
    authorId: 'user-lena',
    authorName: 'Lena Fischer',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    authorLevel: 'supporter',
    title: 'Mein erster Tag bei der Tafel 💜',
    content: 'Heute war ich zum ersten Mal bei der Tafel zum Sortieren. Was für eine Erfahrung! Das Team war so herzlich und ich habe so viele interessante Menschen kennengelernt. Wir haben über 200 kg Lebensmittel sortiert, die sonst weggeworfen worden wären. Ich komme definitiv wieder!',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    linkedChallengeId: 'chal-3',
    linkedChallenge: {
      id: 'chal-3',
      title: 'Lebensmittel sortieren bei der Tafel',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      organizationName: 'Tafel Rhein-Main e.V.',
      category: 'social',
      xpReward: 50,
      durationMinutes: 30,
    },
    submissionId: 'sub-lena-tafel',
    xpEarned: 50,
    reactions: { heart: 34, celebrate: 28, inspiring: 19, thanks: 15 },
    totalReactions: 96,
    commentsCount: 12,
    comments: [
      {
        id: 'comment-4',
        postId: 'post-success-1',
        userId: 'user-tim',
        userName: 'Tim Weber',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
        userLevel: 'supporter',
        content: 'Stark Lena! 🙌 Das motiviert mich, auch mal hinzugehen!',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'comment-5',
        postId: 'post-success-1',
        userId: 'user-max',
        userName: 'Max Mustermann',
        userAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
        userLevel: 'helper',
        content: 'Respekt! 200 kg ist echt viel 💪',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'post-success-2',
    type: 'success_story',
    authorType: 'user',
    authorId: 'user-tim',
    authorName: 'Tim Weber',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    authorLevel: 'supporter',
    title: 'Challenge #45 geschafft! 🏆',
    content: 'Mit der Erste-Hilfe-Info Challenge habe ich jetzt 45 Challenges abgeschlossen! Was als Zeitvertreib begann, ist zu einer echten Leidenschaft geworden. Ich habe so viele tolle Organisationen kennengelernt und dabei sogar wichtige Skills gelernt. Danke SolvTerra!',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    linkedChallengeId: 'chal-7',
    linkedChallenge: {
      id: 'chal-7',
      title: 'Erste-Hilfe-Wissen teilen',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
      organizationName: 'Deutsches Rotes Kreuz Hessen',
      category: 'health',
      xpReward: 30,
      durationMinutes: 15,
    },
    submissionId: 'sub-tim-erstehilfe',
    xpEarned: 30,
    reactions: { heart: 52, celebrate: 67, inspiring: 34, thanks: 21 },
    totalReactions: 174,
    commentsCount: 18,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: 'post-success-3',
    type: 'success_story',
    authorType: 'user',
    authorId: 'user-anna',
    authorName: 'Anna Schneider',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaStar',
    authorLevel: 'helper',
    title: 'Team-Challenge mit meinen besten Freunden! 🎉',
    content: 'Mit Jonas und Marie haben wir zusammen Müll im Herrngarten gesammelt. Es hat so viel Spaß gemacht! Wir haben 3 volle Müllsäcke gesammelt und dabei mega viel gelacht. Das Beste am Helfen? Es zusammen zu machen!',
    imageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=800',
    linkedChallengeId: 'chal-team-1',
    linkedChallenge: {
      id: 'chal-team-1',
      title: 'Gemeinsame Müllsammelaktion',
      imageUrl: 'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=400',
      organizationName: 'NABU Ortsgruppe Darmstadt',
      category: 'environment',
      xpReward: 75,
      durationMinutes: 30,
    },
    teamMemberNames: ['Anna', 'Jonas', 'Marie'],
    submissionId: 'sub-anna-team',
    xpEarned: 75,
    reactions: { heart: 41, celebrate: 53, inspiring: 27, thanks: 18 },
    totalReactions: 139,
    commentsCount: 9,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },

  // ============================================
  // AUTO-GENERATED ACTIVITY POSTS
  // ============================================
  {
    id: 'post-activity-1',
    type: 'challenge_completed',
    authorType: 'user',
    authorId: 'user-max',
    authorName: 'Max Mustermann',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxPro',
    authorLevel: 'helper',
    linkedChallengeId: 'chal-1',
    linkedChallenge: {
      id: 'chal-1',
      title: 'Müllsammelaktion im Park dokumentieren',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
      organizationName: 'NABU Ortsgruppe Darmstadt',
      category: 'environment',
      xpReward: 30,
      durationMinutes: 15,
    },
    xpEarned: 30,
    reactions: { heart: 12, celebrate: 8, inspiring: 5, thanks: 3 },
    totalReactions: 28,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
  },
  {
    id: 'post-activity-2',
    type: 'badge_earned',
    authorType: 'user',
    authorId: 'user-tim',
    authorName: 'Tim Weber',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimGamer',
    authorLevel: 'supporter',
    badgeId: 'twentyfive-challenges',
    badgeName: 'Dedicated Helper',
    badgeIcon: 'award',
    reactions: { heart: 28, celebrate: 45, inspiring: 12, thanks: 8 },
    totalReactions: 93,
    commentsCount: 7,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
  },
  {
    id: 'post-activity-3',
    type: 'level_up',
    authorType: 'user',
    authorId: 'user-jonas',
    authorName: 'Jonas Hoffmann',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JonasBlue',
    authorLevel: 'helper',
    newLevel: 'helper',
    reactions: { heart: 18, celebrate: 32, inspiring: 9, thanks: 6 },
    totalReactions: 65,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: 'post-activity-4',
    type: 'streak_achieved',
    authorType: 'user',
    authorId: 'user-lena',
    authorName: 'Lena Fischer',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LenaHeart',
    authorLevel: 'supporter',
    streakDays: 7,
    reactions: { heart: 31, celebrate: 24, inspiring: 18, thanks: 12 },
    totalReactions: 85,
    commentsCount: 6,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'post-activity-5',
    type: 'team_challenge',
    authorType: 'user',
    authorId: 'user-felix',
    authorName: 'Felix Braun',
    authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FelixGreen',
    authorLevel: 'helper',
    linkedChallengeId: 'chal-team-2',
    linkedChallenge: {
      id: 'chal-team-2',
      title: 'Team-Recherche: Bildungsmaterialien',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      organizationName: 'Bildungsinitiative Frankfurt',
      category: 'education',
      xpReward: 45,
      durationMinutes: 15,
    },
    teamMemberNames: ['Felix', 'Tim'],
    xpEarned: 45,
    reactions: { heart: 15, celebrate: 22, inspiring: 11, thanks: 9 },
    totalReactions: 57,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
  },
];

// ============================================
// HELPER FUNCTIONS FOR COMMUNITY
// ============================================

export const getCommunityPostById = (id: string): CommunityPost | undefined => {
  return MOCK_COMMUNITY_POSTS.find((p) => p.id === id);
};

export const getPostsByOrganization = (orgId: string): CommunityPost[] => {
  return MOCK_COMMUNITY_POSTS.filter((p) => p.organizationId === orgId);
};

export const getNgoPromotionalPosts = (): CommunityPost[] => {
  return MOCK_COMMUNITY_POSTS.filter((p) => p.type === 'ngo_promotion');
};

export const getUserSuccessStories = (userId?: string): CommunityPost[] => {
  const stories = MOCK_COMMUNITY_POSTS.filter((p) => p.type === 'success_story');
  return userId ? stories.filter((s) => s.authorId === userId) : stories;
};

export const getPinnedPosts = (): CommunityPost[] => {
  return MOCK_COMMUNITY_POSTS.filter((p) => p.isPinned);
};

export const getHighlightedPosts = (): CommunityPost[] => {
  return MOCK_COMMUNITY_POSTS.filter((p) => p.isHighlighted);
};
