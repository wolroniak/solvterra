-- ============================================
-- SolvTerra Seed Data
-- ============================================
-- Run this after all migrations to populate the database with demo data
-- Can be re-run to reset database to clean demo state
--
-- NOTE: This seed creates base data. After running this:
-- 1. Create auth users in Supabase Dashboard for NGO admins
-- 2. Link them using the ngo_admins inserts at the bottom
-- 3. Create an admin auth user and link via solvterra_admins
-- ============================================

-- Clear existing data (order matters due to foreign keys)
TRUNCATE support_tickets CASCADE;
TRUNCATE notifications CASCADE;
TRUNCATE submissions CASCADE;
TRUNCATE challenges CASCADE;
TRUNCATE users CASCADE;
TRUNCATE ngo_admins CASCADE;
TRUNCATE solvterra_admins CASCADE;
TRUNCATE organizations CASCADE;

-- ============================================
-- ORGANIZATIONS (7 NGOs across all categories)
-- ============================================

-- Organization 1: NABU (Environment)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 2: Tafel (Social)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 3: Bildungsinitiative (Education)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 4: Tierheim (Animals)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 5: DRK Hessen (Health)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 6: Kulturbrücke (Culture)
INSERT INTO organizations (id, name, description, mission, logo, website, contact_email, category, verification_status, is_verified)
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
  true
);

-- Organization 7: Seniorenhilfe (Social) - Pending verification
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
-- USERS (Demo Students)
-- ============================================

-- User 1: Max - Helper level
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000001',
  'Max Mustermann',
  'max.mustermann@student.tu-darmstadt.de',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  280,
  2
);

-- User 2: Lena - Supporter level
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000002',
  'Lena Fischer',
  'lena.fischer@student.uni-frankfurt.de',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  520,
  3
);

-- User 3: Tim - Advanced Supporter
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000003',
  'Tim Weber',
  'tim.weber@student.tum.de',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  1850,
  3
);

-- User 4: Anna - Champion level
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000004',
  'Anna Schneider',
  'anna.schneider@student.uni-mainz.de',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  2450,
  4
);

-- User 5: Jonas - Starter level
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000005',
  'Jonas Hoffmann',
  'jonas.hoffmann@student.h-da.de',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  45,
  1
);

-- User 6: Marie - Helper level
INSERT INTO users (id, name, email, avatar, xp, level)
VALUES (
  '22222222-0000-0000-0000-000000000006',
  'Marie Becker',
  'marie.becker@student.goethe-uni.de',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  180,
  2
);

-- ============================================
-- CHALLENGES (15+ diverse challenges)
-- ============================================

-- Challenge 1: NABU - Müllsammeln (Onsite, 30 min, Environment)
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

-- Challenge 2: NABU - Social Media (Digital, 5 min, Environment)
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

-- Challenge 3: Tafel - Lebensmittel sortieren (Onsite, 30 min, Social)
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

-- Challenge 4: Tafel - Social Media Post (Digital, 5 min, Social)
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

-- Challenge 5: Tafel - Flyer verteilen (Onsite, 15 min, Social)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000005',
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

-- Challenge 6: Bildungsinitiative - Buch recherchieren (Digital, 15 min, Education)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000006',
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

-- Challenge 7: Bildungsinitiative - Erklärvideo (Digital, 30 min, Education)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000007',
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

-- Challenge 8: Tierheim - Social Media Tierprofile (Digital, 10 min, Animals)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000008',
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

-- Challenge 9: Tierheim - Gassi gehen (Onsite, 30 min, Animals)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000009',
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

-- Challenge 10: DRK - Erste Hilfe Wissen (Digital, 10 min, Health)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000010',
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

-- Challenge 11: DRK - Blutspende begleiten (Onsite, 15 min, Health)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000011',
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

-- Challenge 12: Kulturbrücke - Sprachcafe (Onsite, 30 min, Culture)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000012',
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

-- Challenge 13: Kulturbrücke - Rezept teilen (Digital, 10 min, Culture)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000013',
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

-- Challenge 14: Seniorenhilfe - Telefonat (Digital, 15 min, Social) - Pending org
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, schedule_type, published_at)
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
  'flexible',
  NULL
);

-- Challenge 15: NABU - Nistkastenbau Team (Onsite, 30 min, Environment, Team Challenge)
INSERT INTO challenges (id, organization_id, title, title_en, description, description_en, instructions, instructions_en, category, type, duration_minutes, xp_reward, verification_method, max_participants, current_participants, status, image_url, location_name, location_address, schedule_type, is_multi_person, min_team_size, max_team_size, published_at)
VALUES (
  '33333333-0000-0000-0000-000000000015',
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

-- ============================================
-- SUBMISSIONS (Various states for demo)
-- ============================================

-- Submission 1: In progress (Max working on trash collection)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000001',
  '33333333-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000001',
  'in_progress',
  'photo',
  now() - interval '2 hours'
);

-- Submission 2: Submitted, awaiting review (Max shared social post)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, submitted_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000002',
  '33333333-0000-0000-0000-000000000004',
  '22222222-0000-0000-0000-000000000001',
  'submitted',
  'photo',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
  'Auf Instagram geteilt - tolle Aktion der Tafel!',
  now() - interval '30 minutes',
  now() - interval '1 hour'
);

-- Submission 3: Approved (Lena completed first aid quiz)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_text, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000003',
  '33333333-0000-0000-0000-000000000010',
  '22222222-0000-0000-0000-000000000002',
  'approved',
  'text',
  'Quiz-Bestätigung: DRK-EH-2024-8847 - Punktzahl: 9/10',
  'Super Quiz! Jetzt weiß ich wieder, wie die stabile Seitenlage geht.',
  5,
  'Hervorragende Leistung! Danke fürs Auffrischen deines Wissens.',
  20,
  now() - interval '2 days',
  now() - interval '1 day',
  now() - interval '3 days'
);

-- Submission 4: Approved (Tim sorted food)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_url, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000004',
  '33333333-0000-0000-0000-000000000003',
  '22222222-0000-0000-0000-000000000003',
  'approved',
  'photo',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
  'Drei Stunden Lebensmittel sortiert - tolles Team!',
  5,
  'Tim war sehr zuverlässig und hat super mitgeholfen. Gerne wieder!',
  50,
  now() - interval '5 days',
  now() - interval '4 days',
  now() - interval '6 days'
);

-- Submission 5: Rejected (Jonas - incomplete proof)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_text, caption, ngo_rating, ngo_feedback, submitted_at, reviewed_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000005',
  '33333333-0000-0000-0000-000000000006',
  '22222222-0000-0000-0000-000000000005',
  'rejected',
  'text',
  'Habe gegoogelt',
  'Ein paar Links gefunden',
  2,
  'Leider zu unvollständig. Bitte erstelle eine Liste mit mindestens 5 Ressourcen inkl. Links.',
  now() - interval '3 days',
  now() - interval '2 days',
  now() - interval '4 days'
);

-- Submission 6: Submitted (Anna waiting for language cafe confirmation)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, caption, submitted_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000006',
  '33333333-0000-0000-0000-000000000012',
  '22222222-0000-0000-0000-000000000004',
  'submitted',
  'none',
  'Tolles Gespräch mit Ahmad aus Syrien. Wir haben über Fußball geredet!',
  now() - interval '4 hours',
  now() - interval '5 hours'
);

-- Submission 7: Approved (Marie created pet profile)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, proof_text, caption, ngo_rating, ngo_feedback, xp_earned, submitted_at, reviewed_at, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000007',
  '33333333-0000-0000-0000-000000000008',
  '22222222-0000-0000-0000-000000000006',
  'approved',
  'text',
  'Bella (5 Jahre, Mischling) sucht ein neues Zuhause! Diese sanfte Hündin liebt lange Spaziergänge und Streicheleinheiten. Sie ist stubenrein und versteht sich gut mit Kindern. Wer schenkt Bella eine zweite Chance?',
  'Hoffentlich findet Bella bald ein Zuhause!',
  5,
  'Wunderschön geschrieben! Der Post hat schon viele Likes bekommen. Danke!',
  20,
  now() - interval '1 day',
  now() - interval '12 hours',
  now() - interval '2 days'
);

-- Submission 8: In progress (Lena working on recipe)
INSERT INTO submissions (id, challenge_id, user_id, status, proof_type, created_at)
VALUES (
  '44444444-0000-0000-0000-000000000008',
  '33333333-0000-0000-0000-000000000013',
  '22222222-0000-0000-0000-000000000002',
  'in_progress',
  'text',
  now() - interval '3 hours'
);

-- ============================================
-- NOTIFICATIONS (For demo organizations)
-- ============================================

-- Notification 1: Tafel - new submission
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  'Neue Einreichung',
  'Max Mustermann hat eine Einreichung für "Social Media Beitrag teilen" eingereicht.',
  'info',
  false,
  '/submissions',
  now() - interval '30 minutes'
);

-- Notification 2: Tafel - challenge popular
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000002',
  'Challenge beliebt',
  'Ihre Challenge "Lebensmittel sortieren" hat 50% der maximalen Teilnehmer erreicht!',
  'success',
  true,
  '/challenges',
  now() - interval '2 days'
);

-- Notification 3: NABU - verification confirmed
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000001',
  'Verifizierung erfolgreich',
  'Ihre Organisation wurde erfolgreich verifiziert. Sie können jetzt Challenges erstellen.',
  'success',
  true,
  '/challenges/new',
  now() - interval '14 days'
);

-- Notification 4: Tierheim - new submission
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000004',
  'Neue Einreichung',
  'Marie Becker hat ein Tierprofil für "Tierprofil für Social Media erstellen" eingereicht.',
  'info',
  false,
  '/submissions',
  now() - interval '1 day'
);

-- Notification 5: Kulturbrücke - submission pending
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000005',
  '11111111-0000-0000-0000-000000000006',
  'Einreichung wartet',
  'Anna Schneider wartet auf Bestätigung für das Sprachcafé. Bitte bestätigen Sie die Teilnahme.',
  'warning',
  false,
  '/submissions',
  now() - interval '4 hours'
);

-- Notification 6: Seniorenhilfe - pending verification reminder
INSERT INTO notifications (id, organization_id, title, message, type, is_read, link, created_at)
VALUES (
  '55555555-0000-0000-0000-000000000006',
  '11111111-0000-0000-0000-000000000007',
  'Verifizierung ausstehend',
  'Ihre Organisation wartet noch auf Verifizierung. Dies kann einige Tage dauern.',
  'info',
  false,
  '/settings',
  now() - interval '1 day'
);

-- ============================================
-- SUPPORT TICKETS (Demo tickets)
-- ============================================

-- Ticket 1: Seniorenhilfe - appeal for verification
INSERT INTO support_tickets (id, organization_id, type, subject, message, status, created_at)
VALUES (
  '66666666-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000007',
  'support',
  'Frage zur Verifizierung',
  'Hallo, wir haben uns vor 3 Tagen registriert und warten noch auf die Verifizierung. Können Sie uns sagen, wie lange es noch dauert? Wir möchten gerne unsere Challenges starten. Mit freundlichen Grüßen, Seniorenhilfe Team',
  'open',
  now() - interval '1 day'
);

-- Ticket 2: NABU - feedback
INSERT INTO support_tickets (id, organization_id, type, subject, message, status, admin_response, responded_at, created_at, updated_at)
VALUES (
  '66666666-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000001',
  'feedback',
  'Tolle Plattform - ein Vorschlag',
  'Liebes SolvTerra-Team, wir sind sehr zufrieden mit der Plattform! Ein Vorschlag: Wäre es möglich, wiederkehrende Challenges automatisch zu erneuern? Das würde uns viel Arbeit ersparen. Beste Grüße',
  'resolved',
  'Vielen Dank für Ihr positives Feedback und den tollen Vorschlag! Wir haben das Feature auf unsere Roadmap gesetzt. Bis dahin können Sie Challenges einfach duplizieren. Beste Grüße, Ihr SolvTerra-Team',
  now() - interval '5 days',
  now() - interval '10 days',
  now() - interval '5 days'
);

-- Ticket 3: Tafel - support request
INSERT INTO support_tickets (id, organization_id, type, subject, message, status, created_at)
VALUES (
  '66666666-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000002',
  'support',
  'Wie ändere ich das Logo?',
  'Guten Tag, ich möchte unser Organisationslogo aktualisieren, finde aber die Option nicht. Können Sie mir helfen? Vielen Dank!',
  'in_progress',
  now() - interval '6 hours'
);

-- ============================================
-- LINKING TABLES (ngo_admins, solvterra_admins)
-- ============================================
-- NOTE: These require auth.users entries. Run these AFTER creating
-- Supabase Auth users and replace the UUIDs accordingly.
--
-- Example for linking an NGO admin:
-- INSERT INTO ngo_admins (user_id, organization_id, role)
-- VALUES ('<auth-user-uuid>', '11111111-0000-0000-0000-000000000002', 'owner');
--
-- Example for creating a SolvTerra admin:
-- INSERT INTO solvterra_admins (user_id, role, name)
-- VALUES ('<auth-user-uuid>', 'super_admin', 'Admin Name');
-- ============================================

-- ============================================
-- SUMMARY
-- ============================================
-- Organizations: 7 (6 verified, 1 pending)
-- Users: 6 demo students
-- Challenges: 15 (13 active, 1 draft, various categories/types)
-- Submissions: 8 (various states: in_progress, submitted, approved, rejected)
-- Notifications: 6 demo notifications
-- Support Tickets: 3 demo tickets
-- ============================================
