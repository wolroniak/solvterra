-- Migration: 023_badge_progress.sql
-- Function to get badge progress for a user

-- ============================================
-- Badge progress function
-- Returns progress toward all badges as JSONB
-- ============================================

CREATE OR REPLACE FUNCTION get_badge_progress(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB := '{}';
    v_badge RECORD;
    v_current INT;
    v_required INT;
    v_user_stats RECORD;
    v_category_counts JSONB;
    v_earned_badges TEXT[];
    v_criteria_category TEXT;
    v_time_hour INT;
    v_time_check TEXT;
BEGIN
    -- Get user stats
    SELECT
        COALESCE(completed_challenges, 0) as completed_challenges,
        COALESCE(current_streak, 0) as current_streak
    INTO v_user_stats
    FROM users
    WHERE id = p_user_id;

    -- If user not found, return empty progress for all badges
    IF NOT FOUND THEN
        FOR v_badge IN SELECT * FROM badges LOOP
            v_result := v_result || jsonb_build_object(
                v_badge.id, jsonb_build_object(
                    'current', 0,
                    'required', 1,
                    'completed', false
                )
            );
        END LOOP;
        RETURN v_result;
    END IF;

    -- Get earned badge IDs
    SELECT COALESCE(array_agg(badge_id), '{}') INTO v_earned_badges
    FROM user_badges
    WHERE user_id = p_user_id;

    -- Get category counts
    SELECT COALESCE(jsonb_object_agg(category, cnt), '{}'::jsonb) INTO v_category_counts
    FROM (
        SELECT c.category, COUNT(*)::int as cnt
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = p_user_id AND s.status = 'approved'
        GROUP BY c.category
    ) sub;

    -- Calculate progress for each badge
    FOR v_badge IN SELECT * FROM badges LOOP
        v_required := 1;
        v_current := 0;

        CASE v_badge.criteria_type
            -- Challenge count badges
            WHEN 'challenge_count' THEN
                v_required := (v_badge.criteria_value->>'count')::INT;
                v_current := LEAST(v_user_stats.completed_challenges, v_required);

            -- Category-specific badges
            WHEN 'category_count' THEN
                v_criteria_category := v_badge.criteria_value->>'category';
                v_required := (v_badge.criteria_value->>'count')::INT;
                v_current := LEAST(
                    COALESCE((v_category_counts->>v_criteria_category)::INT, 0),
                    v_required
                );

            -- Time-based badges (binary: 0 or 1)
            WHEN 'time_of_day' THEN
                v_required := 1;
                IF v_badge.id = ANY(v_earned_badges) THEN
                    v_current := 1;
                ELSE
                    -- Check if there's any qualifying submission
                    IF v_badge.criteria_value ? 'before' THEN
                        v_time_check := v_badge.criteria_value->>'before';
                        v_time_hour := SPLIT_PART(v_time_check, ':', 1)::INT;
                        SELECT CASE WHEN EXISTS(
                            SELECT 1 FROM submissions s
                            WHERE s.user_id = p_user_id
                            AND s.status = 'approved'
                            AND EXTRACT(HOUR FROM s.updated_at AT TIME ZONE 'Europe/Berlin') < v_time_hour
                        ) THEN 1 ELSE 0 END INTO v_current;
                    ELSIF v_badge.criteria_value ? 'after' THEN
                        v_time_check := v_badge.criteria_value->>'after';
                        v_time_hour := SPLIT_PART(v_time_check, ':', 1)::INT;
                        SELECT CASE WHEN EXISTS(
                            SELECT 1 FROM submissions s
                            WHERE s.user_id = p_user_id
                            AND s.status = 'approved'
                            AND EXTRACT(HOUR FROM s.updated_at AT TIME ZONE 'Europe/Berlin') >= v_time_hour
                        ) THEN 1 ELSE 0 END INTO v_current;
                    END IF;
                END IF;

            -- Streak badges
            WHEN 'streak_days' THEN
                v_required := (v_badge.criteria_value->>'days')::INT;
                v_current := LEAST(v_user_stats.current_streak, v_required);

            -- Rating badges
            WHEN 'rating_count' THEN
                v_required := (v_badge.criteria_value->>'count')::INT;
                SELECT LEAST(COUNT(*)::int, v_required) INTO v_current
                FROM submissions s
                WHERE s.user_id = p_user_id
                AND s.status = 'approved'
                AND s.rating = (v_badge.criteria_value->>'rating')::INT;

        END CASE;

        v_result := v_result || jsonb_build_object(
            v_badge.id, jsonb_build_object(
                'current', v_current,
                'required', v_required,
                'completed', v_badge.id = ANY(v_earned_badges)
            )
        );
    END LOOP;

    RETURN v_result;
END;
$$;

-- ============================================
-- Grant execute permission
-- ============================================

GRANT EXECUTE ON FUNCTION get_badge_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_badge_progress(UUID) TO service_role;
