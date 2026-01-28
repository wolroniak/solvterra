-- Seed data for community_posts table
-- References existing users, challenges, and submissions from seed.sql
-- Run this AFTER schema.sql, seed.sql, and 006_community_system.sql

-- Community Posts (success stories from approved submissions)
INSERT INTO community_posts (id, user_id, submission_id, challenge_id, type, content, image_url, is_highlighted, is_pinned, created_at)
VALUES
  -- Max Mustermann: approved submission for "Baum pflanzen" challenge
  (
    '77777777-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001', -- Max Mustermann
    '44444444-0000-0000-0000-000000000001', -- his approved submission
    '33333333-0000-0000-0000-000000000001', -- Baum pflanzen im Stadtpark
    'success_story',
    'Heute habe ich im Stadtpark einen Baum gepflanzt! Es war eine tolle Erfahrung, etwas Bleibendes für die Natur zu schaffen. Der Eichenbaum wird hoffentlich noch viele Jahre stehen.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    true,
    false,
    NOW() - INTERVAL '2 days'
  ),
  -- Lena Fischer: approved submission for "Lebensmittel retten" challenge
  (
    '77777777-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000000002', -- Lena Fischer
    '44444444-0000-0000-0000-000000000003', -- her approved submission
    '33333333-0000-0000-0000-000000000003', -- Lebensmittel retten
    'success_story',
    'Heute 12 kg Lebensmittel vor der Mülltonne gerettet! Beim lokalen Supermarkt waren so viele gute Sachen dabei. Alles wurde an die Tafel weitergegeben.',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    false,
    false,
    NOW() - INTERVAL '1 day'
  ),
  -- Tim Weber: approved submission for "Plastikmüll sammeln" challenge
  (
    '77777777-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000003', -- Tim Weber
    '44444444-0000-0000-0000-000000000005', -- his approved submission
    '33333333-0000-0000-0000-000000000002', -- Plastikmüll sammeln am Flussufer
    'success_story',
    'Am Flussufer haben wir in nur 30 Minuten zwei volle Säcke Plastikmüll gesammelt. Es ist erschreckend, wie viel Müll in der Natur liegt. Aber jedes bisschen hilft!',
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
    true,
    true,
    NOW() - INTERVAL '3 days'
  ),
  -- Anna Schneider: challenge_completed auto-post
  (
    '77777777-0000-0000-0000-000000000004',
    '22222222-0000-0000-0000-000000000004', -- Anna Schneider
    NULL,
    '33333333-0000-0000-0000-000000000006', -- Senioren besuchen
    'challenge_completed',
    'Senioren im Altenheim besucht und gemeinsam Karten gespielt. Die Freude in ihren Augen war unbezahlbar.',
    NULL,
    false,
    false,
    NOW() - INTERVAL '5 days'
  ),
  -- Marie Becker: success story
  (
    '77777777-0000-0000-0000-000000000005',
    '22222222-0000-0000-0000-000000000006', -- Marie Becker
    NULL,
    '33333333-0000-0000-0000-000000000004', -- Insektenhotel bauen
    'success_story',
    'Mein erstes Insektenhotel ist fertig! Aus alten Holzresten und Bambusrohren gebaut. Jetzt warten wir auf die ersten Bewohner.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    false,
    false,
    NOW() - INTERVAL '4 days'
  ),
  -- Jonas Hoffmann: badge earned
  (
    '77777777-0000-0000-0000-000000000006',
    '22222222-0000-0000-0000-000000000005', -- Jonas Hoffmann
    NULL,
    NULL,
    'badge_earned',
    'Erstes Abzeichen verdient: Umwelt-Held! Weiter geht''s.',
    NULL,
    false,
    false,
    NOW() - INTERVAL '6 days'
  );

-- Likes on posts
INSERT INTO community_likes (post_id, user_id, created_at)
VALUES
  -- Post 1 (Max's tree planting) gets likes from Lena, Tim, Anna
  ('77777777-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day 12 hours'),
  ('77777777-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day 8 hours'),
  ('77777777-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day 3 hours'),
  -- Post 2 (Lena's food rescue) gets likes from Max, Anna, Marie
  ('77777777-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', NOW() - INTERVAL '18 hours'),
  ('77777777-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004', NOW() - INTERVAL '16 hours'),
  ('77777777-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000006', NOW() - INTERVAL '12 hours'),
  -- Post 3 (Tim's plastic cleanup) gets likes from everyone
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days 20 hours'),
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days 18 hours'),
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', NOW() - INTERVAL '2 days 14 hours'),
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000005', NOW() - INTERVAL '2 days 10 hours'),
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000006', NOW() - INTERVAL '2 days 6 hours'),
  -- Post 5 (Marie's insect hotel) gets likes from Tim, Jonas
  ('77777777-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days 12 hours'),
  ('77777777-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', NOW() - INTERVAL '3 days 6 hours');

-- Ensure submissions referenced by community posts have proper approved status and xp_earned values.
-- Submission 001 (Max's trash collection) is referenced as a success story but was seeded as in_progress.
-- Challenge 001 (Müllsammeln im Stadtwald) has xp_reward = 50.
UPDATE submissions
SET status = 'approved',
    xp_earned = 50,
    proof_url = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    caption = 'Müll gesammelt im Stadtwald - zwei volle Säcke!',
    ngo_rating = 5,
    ngo_feedback = 'Super Einsatz, danke Max!',
    submitted_at = created_at + INTERVAL '20 minutes',
    reviewed_at = created_at + INTERVAL '1 day'
WHERE id = '44444444-0000-0000-0000-000000000001';

-- Submission 005 (Tim's plastic cleanup) is referenced as a success story but was seeded as rejected by a different user.
-- Challenge 002 (Teile unseren Naturschutzbeitrag) has xp_reward = 10.
UPDATE submissions
SET status = 'approved',
    user_id = '22222222-0000-0000-0000-000000000003', -- Tim Weber (matches community post author)
    challenge_id = '33333333-0000-0000-0000-000000000002', -- matches community post challenge
    xp_earned = 10,
    proof_url = 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
    caption = 'Plastikmüll am Flussufer gesammelt - erschreckend wie viel da lag!',
    ngo_rating = 5,
    ngo_feedback = 'Toller Einsatz am Flussufer! Danke Tim!',
    submitted_at = created_at + INTERVAL '25 minutes',
    reviewed_at = created_at + INTERVAL '1 day'
WHERE id = '44444444-0000-0000-0000-000000000005';

-- Comments on posts
INSERT INTO community_comments (id, post_id, user_id, content, created_at)
VALUES
  -- Comments on Max's tree planting
  (
    '88888888-0000-0000-0000-000000000001',
    '77777777-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000002', -- Lena
    'Super Aktion! Welche Baumart hast du gepflanzt?',
    NOW() - INTERVAL '1 day 11 hours'
  ),
  (
    '88888888-0000-0000-0000-000000000002',
    '77777777-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001', -- Max (reply)
    'Eine kleine Stieleiche! Die soll bis zu 30 Meter hoch werden.',
    NOW() - INTERVAL '1 day 10 hours'
  ),
  -- Comments on Tim's plastic cleanup
  (
    '88888888-0000-0000-0000-000000000003',
    '77777777-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000004', -- Anna
    'Wahnsinn, wie viel ihr gesammelt habt! Nächstes Mal bin ich dabei.',
    NOW() - INTERVAL '2 days 13 hours'
  ),
  (
    '88888888-0000-0000-0000-000000000004',
    '77777777-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000006', -- Marie
    'Respekt! Genau sowas motiviert mich auch dranzubleiben.',
    NOW() - INTERVAL '2 days 5 hours'
  ),
  -- Comment on Lena's food rescue
  (
    '88888888-0000-0000-0000-000000000005',
    '77777777-0000-0000-0000-000000000002',
    '22222222-0000-0000-0000-000000000003', -- Tim
    '12 kg ist richtig viel! Wo hast du die abgeholt?',
    NOW() - INTERVAL '14 hours'
  );
