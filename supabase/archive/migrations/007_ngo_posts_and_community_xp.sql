-- ============================================
-- 007: NGO Posts & Community XP
--
-- Extends the community_posts table (from 006)
-- to support organization-authored posts and adds
-- a helper function to retrieve total community XP.
--
-- Changes:
--   1. Add organization_id column to community_posts
--   2. Make user_id nullable (NGO posts have no user)
--   3. Add CHECK constraint: exactly one of user_id
--      or organization_id must be set
--   4. Expand the type CHECK to include 'ngo_promotion'
--   5. Add index on organization_id
--   6. Replace INSERT/UPDATE/DELETE RLS policies to
--      support both user posts and NGO admin posts
--   7. Add get_community_total_xp() RPC function
-- ============================================

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- 1. Add organization_id column
ALTER TABLE community_posts
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 2. Make user_id nullable (NGO posts won't have a user)
ALTER TABLE community_posts
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. Exactly one author must be set
ALTER TABLE community_posts
  ADD CONSTRAINT chk_post_author
  CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  );

-- 4. Replace the type CHECK to include 'ngo_promotion'
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_type_check;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_type_check
  CHECK (type IN (
    'success_story',
    'challenge_completed',
    'badge_earned',
    'level_up',
    'streak_achieved',
    'ngo_promotion'
  ));

-- ============================================
-- INDEX
-- ============================================

-- 5. Index on organization_id for faster NGO post lookups
CREATE INDEX idx_community_posts_org_id ON community_posts(organization_id);

-- ============================================
-- RLS POLICY UPDATES
-- ============================================

-- 7. Drop existing write policies (read policy stays unchanged)
DROP POLICY IF EXISTS "Users can create own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

-- 6. Combined INSERT policy: users can create their own posts,
--    NGO admins can create posts for their organization
CREATE POLICY "NGO admins can create org posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );

-- Combined UPDATE policy: own posts or NGO admin for org posts
CREATE POLICY "NGO admins can update org posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );

-- Combined DELETE policy: own posts or NGO admin for org posts
CREATE POLICY "NGO admins can delete org posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- 8. Total XP earned across all approved submissions
CREATE OR REPLACE FUNCTION get_community_total_xp()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(xp_earned), 0)::bigint
  FROM submissions
  WHERE status = 'approved';
$$;
