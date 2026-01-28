-- Migration: RLS for submissions, users, and storage policy hardening
-- Fixes HIGH priority issues #3, #4, #5 from app-analysis

-- ============================================
-- 1. Enable RLS on submissions
-- ============================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- NGO admins can view submissions for their organization's challenges
CREATE POLICY "NGO admins can view org challenge submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN ngo_admins na ON na.organization_id = c.organization_id
      WHERE c.id = submissions.challenge_id
        AND na.id = auth.uid()
    )
  );

-- Solvterra admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solvterra_admins
      WHERE id = auth.uid()
    )
  );

-- Users can create submissions (accept challenges)
CREATE POLICY "Users can create own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions (submit proof, edit)
CREATE POLICY "Users can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- NGO admins can update submissions for their challenges (approve/reject)
CREATE POLICY "NGO admins can update org challenge submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      JOIN ngo_admins na ON na.organization_id = c.organization_id
      WHERE c.id = submissions.challenge_id
        AND na.id = auth.uid()
    )
  );

-- Users can delete their own submissions (cancel challenge)
CREATE POLICY "Users can delete own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 2. Enable RLS on users
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read user profiles (needed for community, leaderboard)
CREATE POLICY "Anyone can read user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- NGO admins can update user XP (when approving submissions)
CREATE POLICY "NGO admins can update user xp"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.id = auth.uid()
    )
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solvterra_admins
      WHERE id = auth.uid()
    )
  );

-- ============================================
-- 3. Restrict proof-photos storage to authenticated users
-- ============================================

-- Drop the old anon policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Authenticated users can upload proof photos
CREATE POLICY "Authenticated users can upload proof photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proof-photos');

-- Anyone can read proof photos (public viewing)
CREATE POLICY "Anyone can read proof photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'proof-photos');

-- Users can update/delete their own proof photos
CREATE POLICY "Users can manage own proof photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proof-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
