-- Migration: Add user statistics columns
-- These track completed challenges and hours contributed

-- ============================================
-- Add stats columns to users table
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS completed_challenges INTEGER DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS hours_contributed DECIMAL(10, 2) DEFAULT 0;

-- ============================================
-- Function to recalculate user stats
-- Called when submissions are approved
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger function for automatic stats update
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats_on_submission_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate when status changes to/from 'approved'
  IF (TG_OP = 'UPDATE' AND (OLD.status != NEW.status)) THEN
    -- Recalculate for the user
    PERFORM recalculate_user_stats(NEW.user_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.status = 'approved') THEN
    PERFORM recalculate_user_stats(NEW.user_id);
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'approved') THEN
    PERFORM recalculate_user_stats(OLD.user_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create trigger on submissions table
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_user_stats ON submissions;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE OR DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_submission_change();

-- ============================================
-- Initial calculation for existing users
-- ============================================

-- Recalculate stats for all users with approved submissions
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id FROM submissions WHERE status = 'approved'
  LOOP
    PERFORM recalculate_user_stats(user_record.user_id);
  END LOOP;
END $$;
