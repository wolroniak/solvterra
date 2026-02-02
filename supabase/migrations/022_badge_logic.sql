-- Migration: 022_badge_logic.sql
-- Function to check and award badges based on user activity

-- ============================================
-- Main badge checking function
-- Called after user stats are recalculated
-- ============================================

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS SETOF user_badges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_badge RECORD;
    v_earned BOOLEAN;
    v_user_stats RECORD;
    v_category_counts JSONB;
    v_new_badge user_badges%ROWTYPE;
    v_criteria_count INT;
    v_criteria_category TEXT;
    v_time_hour INT;
    v_time_check TEXT;
BEGIN
    -- Get user stats
    SELECT
        COALESCE(completed_challenges, 0) as completed_challenges,
        COALESCE(xp, 0) as xp,
        COALESCE(current_streak, 0) as current_streak
    INTO v_user_stats
    FROM users
    WHERE id = p_user_id;

    -- If user not found, exit early
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Get category completion counts
    SELECT COALESCE(jsonb_object_agg(category, cnt), '{}'::jsonb) INTO v_category_counts
    FROM (
        SELECT c.category, COUNT(*)::int as cnt
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = p_user_id AND s.status = 'approved'
        GROUP BY c.category
    ) sub;

    -- Check each unearned badge
    FOR v_badge IN
        SELECT * FROM badges
        WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
    LOOP
        v_earned := FALSE;

        CASE v_badge.criteria_type
            -- Challenge count badges (first-challenge, five-challenges, etc.)
            WHEN 'challenge_count' THEN
                v_criteria_count := (v_badge.criteria_value->>'count')::INT;
                v_earned := v_user_stats.completed_challenges >= v_criteria_count;

            -- Category-specific badges (eco-warrior, social-butterfly, etc.)
            WHEN 'category_count' THEN
                v_criteria_category := v_badge.criteria_value->>'category';
                v_criteria_count := (v_badge.criteria_value->>'count')::INT;
                v_earned := COALESCE((v_category_counts->>v_criteria_category)::INT, 0) >= v_criteria_count;

            -- Time-based badges (early-bird, night-owl)
            WHEN 'time_of_day' THEN
                IF v_badge.criteria_value ? 'before' THEN
                    v_time_check := v_badge.criteria_value->>'before';
                    v_time_hour := SPLIT_PART(v_time_check, ':', 1)::INT;
                    SELECT EXISTS(
                        SELECT 1 FROM submissions s
                        WHERE s.user_id = p_user_id
                        AND s.status = 'approved'
                        AND EXTRACT(HOUR FROM s.submitted_at AT TIME ZONE 'Europe/Berlin') < v_time_hour
                    ) INTO v_earned;
                ELSIF v_badge.criteria_value ? 'after' THEN
                    v_time_check := v_badge.criteria_value->>'after';
                    v_time_hour := SPLIT_PART(v_time_check, ':', 1)::INT;
                    SELECT EXISTS(
                        SELECT 1 FROM submissions s
                        WHERE s.user_id = p_user_id
                        AND s.status = 'approved'
                        AND EXTRACT(HOUR FROM s.submitted_at AT TIME ZONE 'Europe/Berlin') >= v_time_hour
                    ) INTO v_earned;
                END IF;

            -- Streak badges (week-streak)
            WHEN 'streak_days' THEN
                v_criteria_count := (v_badge.criteria_value->>'days')::INT;
                v_earned := v_user_stats.current_streak >= v_criteria_count;

            -- Rating badges (five-star)
            WHEN 'rating_count' THEN
                v_criteria_count := (v_badge.criteria_value->>'count')::INT;
                SELECT COUNT(*) >= v_criteria_count INTO v_earned
                FROM submissions s
                WHERE s.user_id = p_user_id
                AND s.status = 'approved'
                AND s.ngo_rating = (v_badge.criteria_value->>'rating')::INT;

        END CASE;

        -- Award badge if earned
        IF v_earned THEN
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (p_user_id, v_badge.id)
            ON CONFLICT (user_id, badge_id) DO NOTHING
            RETURNING * INTO v_new_badge;

            -- Only add XP bonus if badge was actually inserted (not a duplicate)
            IF v_new_badge.id IS NOT NULL THEN
                -- Add XP bonus
                UPDATE users
                SET xp = COALESCE(xp, 0) + v_badge.xp_bonus
                WHERE id = p_user_id;

                RETURN NEXT v_new_badge;
            END IF;
        END IF;
    END LOOP;

    RETURN;
END;
$$;

-- ============================================
-- Grant execute permission
-- ============================================

GRANT EXECUTE ON FUNCTION check_and_award_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_badges(UUID) TO service_role;
