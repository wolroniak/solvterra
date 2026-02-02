-- SolvTerra: Reset all data (preserves auth.users and schema)
-- Run this BEFORE seed.sql to clear existing data

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete in correct order (child tables first due to FK constraints)
TRUNCATE TABLE community_comments CASCADE;
TRUNCATE TABLE community_likes CASCADE;
TRUNCATE TABLE community_posts CASCADE;
TRUNCATE TABLE submissions CASCADE;
TRUNCATE TABLE challenges CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE support_tickets CASCADE;
TRUNCATE TABLE ngo_admins CASCADE;
TRUNCATE TABLE solvterra_admins CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify tables are empty
SELECT 'organizations' as table_name, count(*) as rows FROM organizations
UNION ALL SELECT 'users', count(*) FROM users
UNION ALL SELECT 'ngo_admins', count(*) FROM ngo_admins
UNION ALL SELECT 'challenges', count(*) FROM challenges
UNION ALL SELECT 'submissions', count(*) FROM submissions
UNION ALL SELECT 'community_posts', count(*) FROM community_posts
UNION ALL SELECT 'community_likes', count(*) FROM community_likes
UNION ALL SELECT 'community_comments', count(*) FROM community_comments;
