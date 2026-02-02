-- Migration: Fix ngo_admins RLS policies
-- Bug: Policies used ngo_admins.id instead of ngo_admins.user_id
-- ngo_admins.id is an auto-generated UUID, not the auth user ID

-- ============================================
-- Fix submissions SELECT policy for NGO admins
-- ============================================
DROP POLICY IF EXISTS "NGO admins can view org challenge submissions" ON submissions;
CREATE POLICY "NGO admins can view org challenge submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN ngo_admins na ON na.organization_id = c.organization_id
      WHERE c.id = submissions.challenge_id
        AND na.user_id = auth.uid()  -- Fixed: was na.id
    )
  );

-- ============================================
-- Fix submissions UPDATE policy for NGO admins
-- ============================================
DROP POLICY IF EXISTS "NGO admins can update org challenge submissions" ON submissions;
CREATE POLICY "NGO admins can update org challenge submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN ngo_admins na ON na.organization_id = c.organization_id
      WHERE c.id = submissions.challenge_id
        AND na.user_id = auth.uid()  -- Fixed: was na.id
    )
  );

-- ============================================
-- Fix users UPDATE policy for NGO admins (XP updates)
-- ============================================
DROP POLICY IF EXISTS "NGO admins can update user xp" ON users;
CREATE POLICY "NGO admins can update user xp"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.user_id = auth.uid()  -- Fixed: was ngo_admins.id
    )
  );

-- ============================================
-- Fix solvterra_admins policies (same bug pattern)
-- ============================================
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solvterra_admins
      WHERE user_id = auth.uid()  -- Fixed: was id
    )
  );

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solvterra_admins
      WHERE user_id = auth.uid()  -- Fixed: was id
    )
  );
