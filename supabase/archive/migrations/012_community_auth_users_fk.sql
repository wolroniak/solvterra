-- Migration: Change community_likes and community_comments FK from users(id) to auth.users(id)
-- This allows NGO admins (whose auth.uid() exists in auth.users) to like and comment

-- community_likes: drop old FK, clean orphans, add new FK to auth.users
ALTER TABLE community_likes
  DROP CONSTRAINT IF EXISTS community_likes_user_id_fkey;

DELETE FROM community_likes
  WHERE user_id NOT IN (SELECT id FROM auth.users);

ALTER TABLE community_likes
  ADD CONSTRAINT community_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- community_comments: drop old FK, clean orphans, add new FK to auth.users
ALTER TABLE community_comments
  DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;

DELETE FROM community_comments
  WHERE user_id NOT IN (SELECT id FROM auth.users);

ALTER TABLE community_comments
  ADD CONSTRAINT community_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
