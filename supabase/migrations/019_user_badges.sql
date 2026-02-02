-- Migration: 019_user_badges.sql
-- Server-side badge tracking for reliable notifications

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- Index for user badge lookups
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Service role can insert badges (via Edge Functions)
CREATE POLICY "Service can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true);
