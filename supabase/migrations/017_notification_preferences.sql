-- Migration: 017_notification_preferences.sql
-- Student notification preferences

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Submission lifecycle
    submission_reviewed BOOLEAN DEFAULT true,

    -- Challenge discovery
    new_challenges BOOLEAN DEFAULT true,
    challenge_reminders BOOLEAN DEFAULT true,
    challenge_expiring BOOLEAN DEFAULT true,

    -- Gamification
    xp_milestones BOOLEAN DEFAULT true,
    badge_earned BOOLEAN DEFAULT true,
    streak_alerts BOOLEAN DEFAULT true,

    -- Community
    community_likes BOOLEAN DEFAULT false,
    community_comments BOOLEAN DEFAULT true,

    -- Meta
    weekly_digest BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());
