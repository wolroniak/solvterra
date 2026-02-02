-- Migration: Add status and published_at to community_posts
-- Needed for NGO dashboard draft/publish workflow

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published';

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Existing posts are considered published
UPDATE community_posts SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;

-- Add title column for NGO promotion posts
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Add challenge_id reference for linked challenges in NGO posts
-- (already exists from 006, this is a no-op safeguard)
-- ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
