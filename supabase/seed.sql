-- ============================================
-- SolvTerra Seed Data
-- ============================================
-- Run this AFTER schema.sql to populate demo data.
-- Uses real auth.users IDs from Supabase.
--
-- IMPORTANT: Before running this script, you must create users in Supabase Auth
-- and update the UUIDs below to match! Run this query to get your auth.users IDs:
--   SELECT id, email FROM auth.users ORDER BY email;
--
-- auth.users (must exist before running - UPDATE THESE IDs!):
--   NGO Admins:
--   admin@solvterra.de = 84c8e16c-a069-49bb-9c49-9d47659bd021
--   info@nabu-darmstadt.de = d03d4053-ce8c-46ac-bffc-8aac5dd6c302
--   kontakt@tafel-rheinmain.de = 75c62166-5444-4166-b47e-a15fc93fba22
--   info@bildungsinitiative-frankfurt.de = 22600d6c-4ca2-48fd-8861-bcbbf6c43b10
--   info@tierheim-darmstadt.de = 9c97b0c4-1540-4e41-b34a-e2fe588cfc40
--   info@drk-hessen.de = e3090bd6-9687-4efc-bf2a-67976d4b4238
--   kontakt@kulturbruecke-mainz.de = 5a05dd99-38d3-4030-9fd5-231341abba87
--   info@seniorenhilfe-rheinmain.de = 10ff92c9-604d-403b-8dd2-2914c2207f38
--
--   Students (UPDATE THESE IDs to match your auth.users!):
--   max.mustermann@stud.tu-darmstadt.de = 35a17bd0-bd42-41e7-b567-325e9accdea7
--   marieke.euler@stud.tu-darmstadt.de = c57a4cc5-d676-49ad-9c68-42662dd933ed
--   jacob.otto@stud.tu-darmstadt.de = c887c11a-068f-4d43-ad13-535177530e33
--   roland.kasier@stud.tu-darmstadt.de = 2b29867b-60bd-483a-8eec-a3dcfc10ca7d
--   anna.becker@stud.tu-darmstadt.de = 6373ae79-0e2c-4674-a4d0-82d2ccd22f62
--
-- Last updated: 2025-01-28
-- ============================================

-- Clear existing data (order matters due to foreign keys)
TRUNCATE community_comments CASCADE;
TRUNCATE community_likes CASCADE;
TRUNCATE community_posts CASCADE;
TRUNCATE support_tickets CASCADE;
TRUNCATE notifications CASCADE;
TRUNCATE submissions CASCADE;
TRUNCATE challenges CASCADE;
TRUNCATE users CASCADE;
TRUNCATE ngo_admins CASCADE;
TRUNCATE solvterra_admins CASCADE;
TRUNCATE organizations CASCADE;

-- ============================================
-- ORGANIZATIONS (7 NGOs)
-- ============================================

-- Organization 1: NABU (Environment) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000001',
    'NABU Ortsgruppe Darmstadt',
    'Der NABU Darmstadt setzt sich für den Schutz von Vögeln, Insekten und ihren Lebensräumen in der Region ein. Wir organisieren Pflegeeinsätze, Exkursionen und Bildungsveranstaltungen.',
    'Natur und Artenvielfalt in Darmstadt und Umgebung schützen und fördern.',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200',
    'https://www.nabu-darmstadt.de',
    'info@nabu-darmstadt.de',
    'environment',
    'verified',
    true,
    now() - interval '30 days'
);

-- Organization 2: Tafel (Social) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000002',
    'Tafel Rhein-Main e.V.',
    'Die Tafel Rhein-Main sammelt überschüssige Lebensmittel und verteilt sie an bedürftige Menschen in der Region. Über 500 ehrenamtliche Helfer engagieren sich wöchentlich.',
    'Lebensmittelverschwendung reduzieren und Menschen in Not unterstützen.',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200',
    'https://www.tafel-rheinmain.de',
    'kontakt@tafel-rheinmain.de',
    'social',
    'verified',
    true,
    now() - interval '25 days'
);

-- Organization 3: Bildungsinitiative (Education) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000003',
    'Bildungsinitiative Frankfurt',
    'Wir bieten kostenlose Nachhilfe und Lernunterstützung für Schüler aus einkommensschwachen Familien. Unsere ehrenamtlichen Tutoren helfen in allen Fächern.',
    'Chancengleichheit in der Bildung für alle Kinder und Jugendlichen schaffen.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200',
    'https://www.bildungsinitiative-frankfurt.de',
    'info@bildungsinitiative-frankfurt.de',
    'education',
    'verified',
    true,
    now() - interval '20 days'
);

-- Organization 4: Tierheim (Animals) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000004',
    'Tierheim Darmstadt e.V.',
    'Das Tierheim Darmstadt nimmt herrenlose und abgegebene Tiere auf, pflegt sie und vermittelt sie an liebevolle neue Familien. Wir betreuen jährlich über 800 Tiere.',
    'Jedem Tier ein liebevolles Zuhause und artgerechte Betreuung bieten.',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
    'https://www.tierheim-darmstadt.de',
    'info@tierheim-darmstadt.de',
    'animals',
    'verified',
    true,
    now() - interval '18 days'
);

-- Organization 5: DRK Hessen (Health) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000005',
    'Deutsches Rotes Kreuz Hessen',
    'Das DRK Hessen leistet humanitäre Hilfe, Katastrophenschutz und Gesundheitsdienste. Wir bilden Ersthelfer aus und organisieren Blutspenden.',
    'Menschliches Leid zu verhindern und zu lindern, wo immer es uns möglich ist.',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200',
    'https://www.drk-hessen.de',
    'info@drk-hessen.de',
    'health',
    'verified',
    true,
    now() - interval '15 days'
);

-- Organization 6: Kulturbrücke (Culture) - Verified
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified, verified_at)
VALUES (
    '11111111-0000-0000-0000-000000000006',
    'Kulturbrücke Mainz',
    'Die Kulturbrücke fördert den interkulturellen Austausch durch Veranstaltungen, Sprachkurse und gemeinsame Projekte. Wir bringen Menschen verschiedener Kulturen zusammen.',
    'Kulturelle Vielfalt als Bereicherung erlebbar machen und Integration fördern.',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200',
    'https://www.kulturbruecke-mainz.de',
    'kontakt@kulturbruecke-mainz.de',
    'culture',
    'verified',
    true,
    now() - interval '12 days'
);

-- Organization 7: Seniorenhilfe (Social) - Pending
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
VALUES (
    '11111111-0000-0000-0000-000000000007',
    'Seniorenhilfe Rhein-Main e.V.',
    'Wir unterstützen ältere Menschen im Alltag: Einkaufshilfe, Begleitung zu Terminen, Gesellschaft leisten und digitale Hilfe. Unsere Ehrenamtlichen schenken Zeit und Zuwendung.',
    'Senioren ein selbstbestimmtes Leben in Würde und Gemeinschaft ermöglichen.',
    'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=200',
    'https://www.seniorenhilfe-rheinmain.de',
    'info@seniorenhilfe-rheinmain.de',
    'social',
    'pending',
    false
);

-- ============================================
-- NGO ADMINS (link auth.users to organizations)
-- ============================================

INSERT INTO ngo_admins (user_id, organization_id, role) VALUES
    ('d03d4053-ce8c-46ac-bffc-8aac5dd6c302', '11111111-0000-0000-0000-000000000001', 'owner'),  -- NABU
    ('75c62166-5444-4166-b47e-a15fc93fba22', '11111111-0000-0000-0000-000000000002', 'owner'),  -- Tafel
    ('22600d6c-4ca2-48fd-8861-bcbbf6c43b10', '11111111-0000-0000-0000-000000000003', 'owner'),  -- Bildungsinitiative
    ('9c97b0c4-1540-4e41-b34a-e2fe588cfc40', '11111111-0000-0000-0000-000000000004', 'owner'),  -- Tierheim
    ('e3090bd6-9687-4efc-bf2a-67976d4b4238', '11111111-0000-0000-0000-000000000005', 'owner'),  -- DRK
    ('5a05dd99-38d3-4030-9fd5-231341abba87', '11111111-0000-0000-0000-000000000006', 'owner'),  -- Kulturbrücke
    ('10ff92c9-604d-403b-8dd2-2914c2207f38', '11111111-0000-0000-0000-000000000007', 'owner'); -- Seniorenhilfe

-- ============================================
-- SOLVTERRA ADMIN
-- ============================================

INSERT INTO solvterra_admins (user_id, role, name)
VALUES ('84c8e16c-a069-49bb-9c49-9d47659bd021', 'super_admin', 'SolvTerra Admin');

-- ============================================
-- USERS (Students) - 5 students for demo scenarios
-- Note: user.id = auth.users.id for students
-- Level: 1=starter (0-99 XP), 2=helper (100-499), 3=supporter (500-1999), 4=champion (2000-4999), 5=legend (5000+)
-- Stats are calculated from approved submissions:
--   completed_challenges: COUNT of approved submissions
--   hours_contributed: SUM of challenge duration_minutes / 60
--   xp: SUM of xp_earned from approved submissions
-- ============================================

-- Max: Experienced user with multiple completed challenges
-- Approved: Müllsammeln (30 min, 50 XP) + Erste-Hilfe-Quiz (10 min, 20 XP) = 2 challenges, 0.67h, 70 XP
INSERT INTO users (id, name, email, avatar, xp, level, completed_challenges, hours_contributed)
VALUES (
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    'Max Mustermann',
    'max.mustermann@stud.tu-darmstadt.de',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=b6e3f4',
    70,
    1,
    2,
    0.67
);

-- Marieke: New user, first challenge submitted (pending review)
INSERT INTO users (id, name, email, avatar, xp, level, completed_challenges, hours_contributed)
VALUES (
    'c57a4cc5-d676-49ad-9c68-42662dd933ed',
    'Marieke Euler',
    'marieke.euler@stud.tu-darmstadt.de',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Marieke&backgroundColor=ffd5dc',
    0,
    1,
    0,
    0
);

-- Jacob: Has a challenge in progress
INSERT INTO users (id, name, email, avatar, xp, level, completed_challenges, hours_contributed)
VALUES (
    'c887c11a-068f-4d43-ad13-535177530e33',
    'Jacob Otto',
    'jacob.otto@stud.tu-darmstadt.de',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacob&backgroundColor=d1d4f9',
    0,
    1,
    0,
    0
);

-- Roland: Has one approved submission (Social Media Share - 5 min, 10 XP)
INSERT INTO users (id, name, email, avatar, xp, level, completed_challenges, hours_contributed)
VALUES (
    '2b29867b-60bd-483a-8eec-a3dcfc10ca7d',
    'Roland Kaiser',
    'roland.kasier@stud.tu-darmstadt.de',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland&backgroundColor=c0aede',
    10,
    1,
    1,
    0.08
);

-- Anna: Had a submission rejected, can resubmit
INSERT INTO users (id, name, email, avatar, xp, level, completed_challenges, hours_contributed)
VALUES (
    '6373ae79-0e2c-4674-a4d0-82d2ccd22f62',
    'Anna Becker',
    'anna.becker@stud.tu-darmstadt.de',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna&backgroundColor=ffdfbf',
    0,
    1,
    0,
    0
);

-- ============================================
-- CHALLENGES (15 diverse challenges)
-- ============================================

-- NABU Challenge 1: Müllsammeln (Onsite, 30 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'Müllsammeln im Stadtwald',
    'Trash Collection in City Forest',
    'Hilf uns, den Darmstädter Stadtwald sauber zu halten! Sammle Müll und trage zum Naturschutz bei.',
    'Help us keep Darmstadt city forest clean! Collect trash and contribute to nature conservation.',
    'Treffpunkt am Parkplatz Oberfeld. Handschuhe und Müllsäcke werden gestellt. Festes Schuhwerk empfohlen.',
    'Meeting point at Oberfeld parking lot. Gloves and trash bags provided. Sturdy footwear recommended.',
    'environment',
    'onsite',
    30,
    50,
    'photo',
    15,
    4,
    'active',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
    'Parkplatz Oberfeld',
    'Erbacher Str. 89, 64287 Darmstadt',
    'fixed',
    now() - interval '5 days'
);

-- NABU Challenge 2: Social Media (Digital, 5 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    'Teile unseren Naturschutzbeitrag',
    'Share Our Conservation Post',
    'Verbreite unsere Botschaft zum Insektenschutz in deinem Netzwerk!',
    'Spread our message about insect protection in your network!',
    'Teile unseren aktuellen Instagram-Post in deiner Story oder auf deinem Feed. Screenshot als Beweis.',
    'Share our current Instagram post in your story or on your feed. Screenshot as proof.',
    'environment',
    'digital',
    5,
    10,
    'photo',
    100,
    23,
    'active',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    'flexible',
    now() - interval '3 days'
);

-- Tafel Challenge 3: Lebensmittel sortieren (Onsite, 30 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, is_multi_person, min_team_size, max_team_size, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000002',
    'Lebensmittel sortieren',
    'Sort Food Donations',
    'Hilf uns beim Sortieren und Verpacken von gespendeten Lebensmitteln für die Verteilung an Bedürftige.',
    'Help us sort and package donated food for distribution to those in need.',
    'Melde dich am Eingang bei unserem Teamleiter. Saubere Kleidung und geschlossene Schuhe erforderlich.',
    'Check in at the entrance with our team leader. Clean clothes and closed shoes required.',
    'social',
    'onsite',
    30,
    50,
    'ngo_confirmation',
    12,
    3,
    'active',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    'Tafel Ausgabestelle Darmstadt',
    'Frankfurter Str. 71, 64293 Darmstadt',
    'recurring',
    true,
    2,
    4,
    now() - interval '7 days'
);

-- Tafel Challenge 4: Social Media (Digital, 5 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000002',
    'Social Media Beitrag teilen',
    'Share Social Media Post',
    'Teile unseren Beitrag über Lebensmittelrettung und erreiche neue Unterstützer!',
    'Share our post about food rescue and reach new supporters!',
    'Teile den verlinkten Beitrag auf Instagram, Facebook oder LinkedIn. Screenshot als Beweis.',
    'Share the linked post on Instagram, Facebook or LinkedIn. Screenshot as proof.',
    'social',
    'digital',
    5,
    10,
    'photo',
    50,
    8,
    'active',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'flexible',
    now() - interval '2 days'
);

-- Bildungsinitiative Challenge 5: Lernmaterialien recherchieren (Digital, 15 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000003',
    'Lernmaterialien recherchieren',
    'Research Learning Materials',
    'Recherchiere kostenlose Online-Lernressourcen für Schüler der Klassen 5-10.',
    'Research free online learning resources for students in grades 5-10.',
    'Suche nach kostenlosen Übungsaufgaben, Videos oder interaktiven Lernseiten. Erstelle eine kurze Liste.',
    'Search for free practice exercises, videos or interactive learning sites. Create a short list.',
    'education',
    'digital',
    15,
    30,
    'text',
    30,
    7,
    'active',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    'flexible',
    now() - interval '6 days'
);

-- Bildungsinitiative Challenge 6: Erklärvideo (Digital, 30 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000006',
    '11111111-0000-0000-0000-000000000003',
    'Erklärvideo erstellen',
    'Create Explainer Video',
    'Erstelle ein kurzes Erklärvideo zu einem Mathe- oder Deutschthema für unsere Schüler.',
    'Create a short explainer video on a math or German topic for our students.',
    'Wähle ein Thema (z.B. Bruchrechnung, Kommasetzung). Video kann mit dem Handy aufgenommen werden.',
    'Choose a topic (e.g. fractions, comma placement). Video can be recorded with phone.',
    'education',
    'digital',
    30,
    50,
    'text',
    10,
    2,
    'active',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'flexible',
    now() - interval '8 days'
);

-- Tierheim Challenge 7: Tierprofil erstellen (Digital, 10 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000007',
    '11111111-0000-0000-0000-000000000004',
    'Tierprofil für Social Media erstellen',
    'Create Pet Profile for Social Media',
    'Schreibe einen ansprechenden Text für eines unserer Vermittlungstiere auf Instagram.',
    'Write an engaging post for one of our adoption animals on Instagram.',
    'Wir schicken dir Infos und Fotos zu einem Tier. Schreibe einen herzlichen, informativen Text.',
    'We will send you info and photos of an animal. Write a warm, informative text.',
    'animals',
    'digital',
    10,
    20,
    'text',
    20,
    5,
    'active',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    'flexible',
    now() - interval '3 days'
);

-- Tierheim Challenge 8: Gassi gehen (Onsite, 30 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000008',
    '11111111-0000-0000-0000-000000000004',
    'Gassi gehen mit Tierheimhund',
    'Walk a Shelter Dog',
    'Nimm einen unserer Hunde mit auf einen Spaziergang und schenke ihm Zeit und Bewegung!',
    'Take one of our dogs for a walk and give them time and exercise!',
    'Melde dich vorher an. Mindestalter 18 Jahre. Einweisung vor Ort. Festes Schuhwerk!',
    'Register in advance. Minimum age 18. On-site briefing. Sturdy footwear!',
    'animals',
    'onsite',
    30,
    50,
    'photo',
    8,
    2,
    'active',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    'Tierheim Darmstadt',
    'Eschollbrücker Str. 100, 64295 Darmstadt',
    'range',
    now() - interval '5 days'
);

-- DRK Challenge 9: Erste-Hilfe-Quiz (Digital, 10 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000009',
    '11111111-0000-0000-0000-000000000005',
    'Erste-Hilfe-Quiz absolvieren',
    'Complete First Aid Quiz',
    'Frische dein Erste-Hilfe-Wissen auf mit unserem Online-Quiz!',
    'Refresh your first aid knowledge with our online quiz!',
    'Beantworte alle 10 Fragen. Am Ende erhältst du eine Bestätigung mit deiner Punktzahl.',
    'Answer all 10 questions. At the end you will receive a confirmation with your score.',
    'health',
    'digital',
    10,
    20,
    'text',
    200,
    45,
    'active',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    'flexible',
    now() - interval '10 days'
);

-- DRK Challenge 10: Blutspende unterstützen (Onsite, 15 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000010',
    '11111111-0000-0000-0000-000000000005',
    'Blutspendetermin unterstützen',
    'Support Blood Donation Event',
    'Hilf bei der Organisation eines Blutspendetermins: Anmeldung, Getränke, Betreuung.',
    'Help organize a blood donation event: registration, drinks, care.',
    'Komm 30 Min vor Beginn. Freundliches Auftreten wichtig. Wir weisen dich ein.',
    'Come 30 min before start. Friendly manner important. We will brief you.',
    'health',
    'onsite',
    15,
    30,
    'ngo_confirmation',
    6,
    0,
    'active',
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
    'DRK Blutspendezentrum',
    'Bleichstr. 50, 64283 Darmstadt',
    'fixed',
    now() - interval '2 days'
);

-- Kulturbrücke Challenge 11: Sprachcafé (Onsite, 30 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000011',
    '11111111-0000-0000-0000-000000000006',
    'Sprachcafé - Deutsch üben',
    'Language Cafe - Practice German',
    'Unterhalte dich mit Geflüchteten und Migranten auf Deutsch. Einfach reden!',
    'Chat with refugees and migrants in German. Just talk!',
    'Komm ins Café, wir stellen dich einem Gesprächspartner vor. Keine Vorbereitung nötig.',
    'Come to the cafe, we will introduce you to a conversation partner. No preparation needed.',
    'culture',
    'onsite',
    30,
    50,
    'ngo_confirmation',
    10,
    4,
    'active',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    'Kulturcafé Mainz',
    'Kaiserstr. 15, 55116 Mainz',
    'recurring',
    now() - interval '7 days'
);

-- Kulturbrücke Challenge 12: Rezept teilen (Digital, 10 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000012',
    '11111111-0000-0000-0000-000000000006',
    'Lieblingsrezept teilen',
    'Share Favorite Recipe',
    'Teile ein Lieblingsrezept aus deiner Kultur für unser interkulturelles Kochbuch!',
    'Share a favorite recipe from your culture for our intercultural cookbook!',
    'Schreibe das Rezept auf Deutsch mit Zutaten und Anleitung. Foto vom fertigen Gericht wenn möglich.',
    'Write the recipe in German with ingredients and instructions. Photo of finished dish if possible.',
    'culture',
    'digital',
    10,
    20,
    'text',
    50,
    12,
    'active',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
    'flexible',
    now() - interval '4 days'
);

-- NABU Challenge 13: Nistkästen bauen (Onsite, 30 min, Team)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, is_multi_person, min_team_size, max_team_size, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000013',
    '11111111-0000-0000-0000-000000000001',
    'Nistkästen bauen - Teamaktion',
    'Build Nesting Boxes - Team Action',
    'Baut gemeinsam Nistkästen für Vögel! Perfekt für Freundesgruppen.',
    'Build nesting boxes for birds together! Perfect for groups of friends.',
    'Treffpunkt am NABU-Haus. Material wird gestellt. Handwerkliches Geschick von Vorteil.',
    'Meeting point at NABU house. Materials provided. Craftsmanship skills helpful.',
    'environment',
    'onsite',
    30,
    50,
    'photo',
    20,
    8,
    'active',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'NABU Naturschutzzentrum',
    'Kranichsteiner Str. 261, 64289 Darmstadt',
    'fixed',
    true,
    2,
    5,
    now() - interval '3 days'
);

-- Seniorenhilfe Challenge 14: Telefonat (Digital, 15 min) - Draft (pending org)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type)
VALUES (
    '33333333-0000-0000-0000-000000000014',
    '11111111-0000-0000-0000-000000000007',
    'Telefonat mit Senior',
    'Phone Call with Senior',
    'Führe ein freundliches Telefonat mit einem älteren Menschen und schenke Zeit.',
    'Have a friendly phone call with an elderly person and give the gift of time.',
    'Wir vermitteln dir eine Person. Ruf an und führe ein lockeres Gespräch über Alltägliches.',
    'We will connect you with a person. Call and have a casual conversation about everyday things.',
    'social',
    'digital',
    15,
    30,
    'text',
    25,
    0,
    'draft',
    'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800',
    'flexible'
);

-- Tafel Challenge 15: Flyer verteilen (Onsite, 15 min)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
    '33333333-0000-0000-0000-000000000015',
    '11111111-0000-0000-0000-000000000002',
    'Flyer in der Innenstadt verteilen',
    'Distribute Flyers Downtown',
    'Verteile Informationsflyer über die Tafel an Passanten und informiere über unsere Arbeit.',
    'Distribute information flyers about the food bank to pedestrians and inform about our work.',
    'Hole die Flyer an der Ausgabestelle ab. Freundlich ansprechen, nicht aufdringlich sein.',
    'Pick up flyers at the distribution center. Be friendly, not pushy.',
    'social',
    'onsite',
    15,
    30,
    'photo',
    6,
    1,
    'active',
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800',
    'Luisenplatz Darmstadt',
    'Luisenplatz, 64283 Darmstadt',
    'flexible',
    now() - interval '4 days'
);

-- ============================================
-- SUBMISSIONS (various states for demo scenarios)
-- ============================================

-- === MAX (experienced user) ===

-- Submission 1: Max - Müllsammeln approved
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000001',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    'approved',
    'photo',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    'Müll gesammelt im Stadtwald - zwei volle Säcke!',
    5,
    'Super Einsatz, danke Max!',
    50,
    now() - interval '2 days',
    now() - interval '1 day',
    now() - interval '3 days'
);

-- Submission 2: Max - Erste-Hilfe-Quiz approved
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_text, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000009',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    'approved',
    'text',
    'Quiz-Bestätigung: DRK-EH-2024-8847 - Punktzahl: 9/10',
    'Super Quiz! Jetzt weiß ich wieder, wie die stabile Seitenlage geht.',
    5,
    'Hervorragende Leistung! Danke fürs Auffrischen deines Wissens.',
    20,
    now() - interval '5 days',
    now() - interval '4 days',
    now() - interval '6 days'
);

-- Submission 3: Max - Social Media submitted (awaiting review)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, submitted_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000003',
    '33333333-0000-0000-0000-000000000004',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    'submitted',
    'photo',
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    'Auf Instagram geteilt - tolle Aktion der Tafel!',
    now() - interval '30 minutes',
    now() - interval '1 hour'
);

-- Submission 4: Max - Rezept teilen in progress
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000004',
    '33333333-0000-0000-0000-000000000012',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    'in_progress',
    'text',
    now() - interval '3 hours'
);

-- === MARIEKE (new user, first submission pending) ===

-- Submission 5: Marieke - Lebensmittel sortieren submitted (pending review - DEMO: Web Dashboard Review)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, submitted_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000005',
    '33333333-0000-0000-0000-000000000003',
    'c57a4cc5-d676-49ad-9c68-42662dd933ed',
    'submitted',
    'photo',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    'Meine erste Challenge! Habe 2 Stunden beim Sortieren geholfen. Tolles Team!',
    now() - interval '2 hours',
    now() - interval '3 hours'
);

-- === JACOB (challenge in progress) ===

-- Submission 6: Jacob - Tierprofil in progress (DEMO: Mobile App - Complete Challenge Flow)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000006',
    '33333333-0000-0000-0000-000000000006',
    'c887c11a-068f-4d43-ad13-535177530e33',
    'in_progress',
    'photo',
    now() - interval '1 day'
);

-- === ROLAND (has approved submission with XP) ===

-- Submission 7: Roland - NABU Social Media Share approved (DEMO: XP Sync)
-- Challenge 2: Teile unseren Naturschutzbeitrag (digital, 5 min, 10 XP)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000007',
    '33333333-0000-0000-0000-000000000002',
    '2b29867b-60bd-483a-8eec-a3dcfc10ca7d',
    'approved',
    'photo',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'NABU Beitrag auf Instagram geteilt! Wichtige Arbeit für den Insektenschutz.',
    5,
    'Danke fürs Teilen! Zusammen erreichen wir mehr Menschen.',
    10,
    now() - interval '4 days',
    now() - interval '3 days',
    now() - interval '5 days'
);

-- === ANNA (has rejected submission - can resubmit) ===

-- Submission 8: Anna - Social Media Share rejected (DEMO: Rejection & Resubmit Flow)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, ngo_rating, ngo_feedback, submitted_at, reviewed_at, created_at)
VALUES (
    '44444444-0000-0000-0000-000000000008',
    '33333333-0000-0000-0000-000000000002',
    '6373ae79-0e2c-4674-a4d0-82d2ccd22f62',
    'rejected',
    'photo',
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800',
    'Hab den Post geteilt!',
    2,
    'Leider konnten wir den Screenshot nicht verifizieren. Bitte teile einen Screenshot, auf dem der geteilte NABU-Post deutlich zu sehen ist. Du kannst es nochmal versuchen!',
    now() - interval '2 days',
    now() - interval '1 day',
    now() - interval '3 days'
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at) VALUES
    -- Tafel - Marieke's pending submission (DEMO: Primary review notification)
    ('55555555-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'Neue Einreichung wartet auf Review', 'Marieke Euler hat eine Einreichung für "Lebensmittel sortieren" eingereicht. Bitte prüfen Sie diese.', 'info', false, '/submissions', now() - interval '2 hours'),
    -- Tafel - Max's pending
    ('55555555-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Neue Einreichung', 'Max Mustermann hat eine Einreichung für "Social Media Beitrag teilen" eingereicht.', 'info', false, '/submissions', now() - interval '30 minutes'),
    ('55555555-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Challenge beliebt', 'Ihre Challenge "Lebensmittel sortieren" hat 50% der maximalen Teilnehmer erreicht!', 'success', true, '/challenges', now() - interval '2 days'),
    -- NABU
    ('55555555-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Verifizierung erfolgreich', 'Ihre Organisation wurde erfolgreich verifiziert. Sie können jetzt Challenges erstellen.', 'success', true, '/challenges/new', now() - interval '14 days'),
    ('55555555-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Einreichung abgelehnt', 'Sie haben Anna Beckers Einreichung für "Teile unseren Naturschutzbeitrag" abgelehnt.', 'info', true, '/submissions', now() - interval '1 day'),
    -- Tierheim - Jacob's in progress
    ('55555555-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000004', 'Neuer Teilnehmer', 'Jacob Otto hat die Challenge "Tierprofil für Social Media erstellen" angenommen.', 'info', true, '/submissions', now() - interval '1 day'),
    -- Kulturbrücke
    ('55555555-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000006', 'Challenge aktiv', 'Ihre Challenge "Sprachcafé - Deutsch üben" ist jetzt aktiv.', 'success', true, '/challenges', now() - interval '7 days'),
    -- Seniorenhilfe (pending verification)
    ('55555555-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000007', 'Verifizierung ausstehend', 'Ihre Organisation wartet noch auf Verifizierung. Dies kann einige Tage dauern.', 'info', false, '/settings', now() - interval '1 day');

-- ============================================
-- SUPPORT TICKETS
-- ============================================

INSERT INTO support_tickets (id, organization_id, type, subject, message, status, created_at) VALUES
    -- Seniorenhilfe - question about verification
    ('66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000007', 'support', 'Frage zur Verifizierung', 'Hallo, wir haben uns vor 3 Tagen registriert und warten noch auf die Verifizierung. Können Sie uns sagen, wie lange es noch dauert? Wir möchten gerne unsere Challenges starten. Mit freundlichen Grüßen, Seniorenhilfe Team', 'open', now() - interval '1 day');

INSERT INTO support_tickets (id, organization_id, type, subject, message, status, admin_response, responded_at, created_at, updated_at) VALUES
    -- NABU - resolved feedback
    ('66666666-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'feedback', 'Tolle Plattform - ein Vorschlag', 'Liebes SolvTerra-Team, wir sind sehr zufrieden mit der Plattform! Ein Vorschlag: Wäre es möglich, wiederkehrende Challenges automatisch zu erneuern? Das würde uns viel Arbeit ersparen. Beste Grüße', 'resolved', 'Vielen Dank für Ihr positives Feedback und den tollen Vorschlag! Wir haben das Feature auf unsere Roadmap gesetzt. Bis dahin können Sie Challenges einfach duplizieren. Beste Grüße, Ihr SolvTerra-Team', now() - interval '5 days', now() - interval '10 days', now() - interval '5 days');

INSERT INTO support_tickets (id, organization_id, type, subject, message, status, created_at) VALUES
    -- Tafel - support request in progress
    ('66666666-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'support', 'Wie ändere ich das Logo?', 'Guten Tag, ich möchte unser Organisationslogo aktualisieren, finde aber die Option nicht. Können Sie mir helfen? Vielen Dank!', 'in_progress', now() - interval '6 hours');

-- ============================================
-- COMMUNITY POSTS
-- ============================================

-- Max's success story (Müllsammeln)
INSERT INTO community_posts (id, user_id, submission_id, challenge_id, type, content, image_url, is_highlighted, is_pinned, status, published_at, created_at)
VALUES (
    '77777777-0000-0000-0000-000000000001',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    '44444444-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000001',
    'success_story',
    'Heute habe ich im Stadtwald Müll gesammelt! Es war eine tolle Erfahrung, etwas für die Natur zu tun. Zwei volle Säcke haben wir gefüllt!',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    true,
    false,
    'published',
    now() - interval '1 day',
    now() - interval '1 day'
);

-- Max's challenge completed (Erste-Hilfe-Quiz)
INSERT INTO community_posts (id, user_id, submission_id, challenge_id, type, content, status, published_at, created_at)
VALUES (
    '77777777-0000-0000-0000-000000000002',
    '35a17bd0-bd42-41e7-b567-325e9accdea7',
    '44444444-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000009',
    'challenge_completed',
    'Erste-Hilfe-Quiz mit 9/10 Punkten bestanden! Jetzt weiß ich wieder, wie man die stabile Seitenlage macht.',
    'published',
    now() - interval '4 days',
    now() - interval '4 days'
);

-- NABU promotion post
INSERT INTO community_posts (id, organization_id, challenge_id, type, title, content, image_url, is_highlighted, status, published_at, created_at)
VALUES (
    '77777777-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000001',
    '33333333-0000-0000-0000-000000000013',
    'ngo_promotion',
    'Nistkästen-Bauaktion am Samstag!',
    'Kommt vorbei und baut mit uns Nistkästen für Vögel! Perfekt für Freundesgruppen. Material wird gestellt, handwerkliches Geschick ist von Vorteil aber nicht erforderlich.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    true,
    'published',
    now() - interval '2 days',
    now() - interval '2 days'
);

-- Tafel promotion post (draft)
INSERT INTO community_posts (id, organization_id, challenge_id, type, title, content, image_url, status, created_at)
VALUES (
    '77777777-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000002',
    '33333333-0000-0000-0000-000000000003',
    'ngo_promotion',
    'Helfer gesucht: Lebensmittel sortieren',
    'Wir suchen Freiwillige für das wöchentliche Sortieren von Lebensmittelspenden. Kommt als Team!',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    'draft',
    now() - interval '1 day'
);

-- Roland's challenge completed (NABU Social Media Share)
INSERT INTO community_posts (id, user_id, submission_id, challenge_id, type, content, status, published_at, created_at)
VALUES (
    '77777777-0000-0000-0000-000000000005',
    '2b29867b-60bd-483a-8eec-a3dcfc10ca7d',
    '44444444-0000-0000-0000-000000000007',
    '33333333-0000-0000-0000-000000000002',
    'challenge_completed',
    'NABU Beitrag auf Instagram geteilt! Zusammen erreichen wir mehr Menschen für den Insektenschutz.',
    'published',
    now() - interval '3 days',
    now() - interval '3 days'
);

-- ============================================
-- COMMUNITY LIKES (use auth.users IDs)
-- ============================================

-- Likes on Max's success story from NGO admins
INSERT INTO community_likes (post_id, user_id, created_at) VALUES
    ('77777777-0000-0000-0000-000000000001', 'd03d4053-ce8c-46ac-bffc-8aac5dd6c302', now() - interval '20 hours'),  -- NABU admin
    ('77777777-0000-0000-0000-000000000001', '75c62166-5444-4166-b47e-a15fc93fba22', now() - interval '18 hours'),  -- Tafel admin
    ('77777777-0000-0000-0000-000000000001', '9c97b0c4-1540-4e41-b34a-e2fe588cfc40', now() - interval '16 hours');  -- Tierheim admin

-- Likes on NABU promotion post
INSERT INTO community_likes (post_id, user_id, created_at) VALUES
    ('77777777-0000-0000-0000-000000000003', '35a17bd0-bd42-41e7-b567-325e9accdea7', now() - interval '1 day 12 hours'),  -- Max
    ('77777777-0000-0000-0000-000000000003', '75c62166-5444-4166-b47e-a15fc93fba22', now() - interval '1 day 10 hours'),   -- Tafel admin
    ('77777777-0000-0000-0000-000000000003', '5a05dd99-38d3-4030-9fd5-231341abba87', now() - interval '1 day 8 hours'),    -- Kulturbrücke admin
    ('77777777-0000-0000-0000-000000000003', '2b29867b-60bd-483a-8eec-a3dcfc10ca7d', now() - interval '1 day 2 hours');    -- Roland

-- Likes on Roland's challenge completed
INSERT INTO community_likes (post_id, user_id, created_at) VALUES
    ('77777777-0000-0000-0000-000000000005', '35a17bd0-bd42-41e7-b567-325e9accdea7', now() - interval '2 days 12 hours'),  -- Max
    ('77777777-0000-0000-0000-000000000005', 'd03d4053-ce8c-46ac-bffc-8aac5dd6c302', now() - interval '2 days 10 hours');   -- NABU admin

-- ============================================
-- COMMUNITY COMMENTS (use auth.users IDs)
-- ============================================

-- Comments on Max's success story
INSERT INTO community_comments (id, post_id, user_id, content, created_at) VALUES
    ('88888888-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', 'd03d4053-ce8c-46ac-bffc-8aac5dd6c302', 'Super Aktion! Danke für deinen Einsatz für die Natur!', now() - interval '19 hours'),  -- NABU admin
    ('88888888-0000-0000-0000-000000000002', '77777777-0000-0000-0000-000000000001', '35a17bd0-bd42-41e7-b567-325e9accdea7', 'Hat echt Spaß gemacht! Gerne wieder.', now() - interval '18 hours');  -- Max

-- Comments on NABU promotion post
INSERT INTO community_comments (id, post_id, user_id, content, created_at) VALUES
    ('88888888-0000-0000-0000-000000000003', '77777777-0000-0000-0000-000000000003', '35a17bd0-bd42-41e7-b567-325e9accdea7', 'Klingt super! Ich komme mit zwei Freunden vorbei.', now() - interval '1 day 6 hours'),  -- Max
    ('88888888-0000-0000-0000-000000000004', '77777777-0000-0000-0000-000000000003', 'd03d4053-ce8c-46ac-bffc-8aac5dd6c302', 'Freut uns! Material ist ausreichend vorhanden.', now() - interval '1 day 4 hours');  -- NABU admin

-- ============================================
-- RECALCULATE USER STATS
-- ============================================
-- This ensures stats (xp, completed_challenges, hours_contributed) are
-- correctly calculated from approved submissions after seeding.
-- The trigger handles future updates automatically.

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Recalculate stats for all users who have submissions
  FOR user_record IN
    SELECT DISTINCT user_id FROM submissions
  LOOP
    PERFORM recalculate_user_stats(user_record.user_id);
  END LOOP;

  RAISE NOTICE 'User stats recalculated successfully';
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Organizations: 7 (6 verified, 1 pending)
-- NGO Admins: 7 (one per organization)
-- SolvTerra Admins: 1
-- Students: 5
--   - Max Mustermann (70 XP, starter level, 2 approved + 1 pending + 1 in_progress)
--   - Marieke Euler (0 XP, starter, 1 submitted/pending review)
--   - Jacob Otto (0 XP, starter, 1 in_progress)
--   - Roland Kaiser (10 XP, starter, 1 approved)
--   - Anna Becker (0 XP, starter, 1 rejected)
-- Challenges: 15 (14 active, 1 draft)
-- Submissions: 8 (3 approved, 2 submitted, 2 in_progress, 1 rejected)
-- Notifications: 8
-- Support Tickets: 3
-- Community Posts: 5 (4 published, 1 draft)
-- Likes: 10
-- Comments: 4
--
-- DEMO SCENARIOS:
-- 1. Web Dashboard: Login as kontakt@tafel-rheinmain.de to review Marieke's submission
-- 2. Mobile App: Login as jacob.otto@stud.tu-darmstadt.de to complete in-progress challenge
-- 3. XP Sync: Login as roland.kasier@stud.tu-darmstadt.de to see XP from approved submission
-- 4. Rejection: Login as anna.becker@stud.tu-darmstadt.de to see rejected submission & resubmit
-- ============================================
