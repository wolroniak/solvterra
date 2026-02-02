-- Migration: 021_badges_table.sql
-- Create badges reference table and update user_badges foreign key

-- ============================================
-- Create badges table
-- ============================================

CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                    -- German name (default)
    name_en TEXT,                          -- English name
    description TEXT NOT NULL,             -- German description
    description_en TEXT,                   -- English description
    icon TEXT NOT NULL,                    -- Feather icon name
    category TEXT NOT NULL CHECK (category IN ('milestone', 'category', 'special', 'streak')),
    xp_bonus INTEGER DEFAULT 0,            -- XP reward when earned
    criteria_type TEXT NOT NULL CHECK (criteria_type IN ('challenge_count', 'category_count', 'time_of_day', 'streak_days', 'rating_count')),
    criteria_value JSONB NOT NULL,         -- Criteria parameters
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Everyone can read badges (they're public reference data)
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (true);

-- ============================================
-- Seed badge data
-- ============================================

INSERT INTO badges (id, name, name_en, description, description_en, icon, category, xp_bonus, criteria_type, criteria_value) VALUES
-- Milestone Badges
('first-challenge', 'Erste Schritte', 'First Steps', 'Schließe deinen ersten Challenge ab', 'Complete your first challenge', 'rocket', 'milestone', 10, 'challenge_count', '{"count": 1}'),
('five-challenges', 'Durchstarter', 'Getting Started', 'Schließe 5 Challenges ab', 'Complete 5 challenges', 'trending-up', 'milestone', 25, 'challenge_count', '{"count": 5}'),
('ten-challenges', 'Auf Kurs', 'On a Roll', 'Schließe 10 Challenges ab', 'Complete 10 challenges', 'zap', 'milestone', 50, 'challenge_count', '{"count": 10}'),
('twentyfive-challenges', 'Engagierter Helfer', 'Dedicated Helper', 'Schließe 25 Challenges ab', 'Complete 25 challenges', 'award', 'milestone', 100, 'challenge_count', '{"count": 25}'),

-- Category Badges
('eco-warrior', 'Öko-Krieger', 'Eco Warrior', 'Schließe 5 Umwelt-Challenges ab', 'Complete 5 environment challenges', 'leaf', 'category', 30, 'category_count', '{"category": "environment", "count": 5}'),
('social-butterfly', 'Sozialheld', 'Social Butterfly', 'Schließe 5 Sozial-Challenges ab', 'Complete 5 social challenges', 'heart', 'category', 30, 'category_count', '{"category": "social", "count": 5}'),
('knowledge-seeker', 'Wissensdurst', 'Knowledge Seeker', 'Schließe 5 Bildungs-Challenges ab', 'Complete 5 education challenges', 'book-open', 'category', 30, 'category_count', '{"category": "education", "count": 5}'),
('health-hero', 'Gesundheitsheld', 'Health Hero', 'Schließe 5 Gesundheits-Challenges ab', 'Complete 5 health challenges', 'activity', 'category', 30, 'category_count', '{"category": "health", "count": 5}'),

-- Special Badges
('early-bird', 'Frühaufsteher', 'Early Bird', 'Schließe einen Challenge vor 8 Uhr ab', 'Complete a challenge before 8 AM', 'sunrise', 'special', 15, 'time_of_day', '{"before": "08:00"}'),
('night-owl', 'Nachteule', 'Night Owl', 'Schließe einen Challenge nach 22 Uhr ab', 'Complete a challenge after 10 PM', 'moon', 'special', 15, 'time_of_day', '{"after": "22:00"}'),
('five-star', 'Fünf Sterne', 'Five Star', 'Erhalte eine 5-Sterne-Bewertung', 'Receive a 5-star rating from an NGO', 'star', 'special', 20, 'rating_count', '{"rating": 5, "count": 1}'),

-- Streak Badges
('week-streak', 'Wochenkrieger', 'Week Warrior', 'Halte eine 7-Tage-Streak', 'Maintain a 7-day streak', 'flame', 'streak', 50, 'streak_days', '{"days": 7}');

-- ============================================
-- Add foreign key to user_badges (if not exists)
-- ============================================

-- First check if constraint exists, then add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_badges_badge_id_fkey'
        AND table_name = 'user_badges'
    ) THEN
        ALTER TABLE user_badges
            ADD CONSTRAINT user_badges_badge_id_fkey
            FOREIGN KEY (badge_id) REFERENCES badges(id);
    END IF;
END $$;

-- ============================================
-- Index for badge lookups
-- ============================================

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
