-- Fix: community_posts RLS policies reference ngo_admins.id instead of ngo_admins.user_id
-- The ngo_admins PK (id) is an auto-generated UUID, not the auth user ID.
-- auth.uid() must be compared to ngo_admins.user_id.

-- Re-create INSERT policy
DROP POLICY IF EXISTS "NGO admins can create org posts" ON community_posts;
CREATE POLICY "NGO admins can create org posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.user_id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );

-- Re-create UPDATE policy
DROP POLICY IF EXISTS "NGO admins can update org posts" ON community_posts;
CREATE POLICY "NGO admins can update org posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.user_id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );

-- Re-create DELETE policy
DROP POLICY IF EXISTS "NGO admins can delete org posts" ON community_posts;
CREATE POLICY "NGO admins can delete org posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM ngo_admins
      WHERE ngo_admins.user_id = auth.uid()
        AND ngo_admins.organization_id = community_posts.organization_id
    )
  );
