-- Migration: 024_badge_trigger_update.sql
-- Update recalculate_user_stats to call check_and_award_badges

-- ============================================
-- Replace recalculate_user_stats function
-- Now includes badge checking at the end
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed INTEGER;
  v_hours DECIMAL(10, 2);
  v_xp INTEGER;
BEGIN
  -- Calculate stats from approved submissions
  SELECT
    COUNT(*),
    COALESCE(SUM(c.duration_minutes) / 60.0, 0),
    COALESCE(SUM(s.xp_earned), 0)
  INTO v_completed, v_hours, v_xp
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
    AND s.status = 'approved';

  -- Update user record
  UPDATE users
  SET
    completed_challenges = v_completed,
    hours_contributed = v_hours,
    xp = v_xp
  WHERE id = p_user_id;

  -- Check and award any earned badges
  -- This function handles XP bonuses internally
  PERFORM check_and_award_badges(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
