-- Migration: 020_notification_triggers.sql
-- Description: Create 9 notification triggers for push notifications
-- These triggers call Edge Functions to send push notifications

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- 1. TRIGGER: notify_submission_reviewed
-- Fires when a submission status changes to 'approved' or 'rejected'
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_submission_reviewed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
BEGIN
  -- Only fire when status changes to approved or rejected
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status IN ('approved', 'rejected') THEN

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      v_payload := jsonb_build_object(
        'type', 'submission_reviewed',
        'submission_id', NEW.id,
        'user_id', NEW.user_id,
        'challenge_id', NEW.challenge_id,
        'status', NEW.status,
        'reviewed_at', NEW.reviewed_at,
        'reviewer_notes', NEW.reviewer_notes
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_submission_reviewed ON submissions;
CREATE TRIGGER trigger_notify_submission_reviewed
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_submission_reviewed();

-- ============================================================================
-- 2. TRIGGER: notify_new_challenge
-- Fires when a challenge status becomes 'active'
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_new_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
BEGIN
  -- Only fire when status changes to active
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'active' THEN

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      v_payload := jsonb_build_object(
        'type', 'new_challenge',
        'challenge_id', NEW.id,
        'organization_id', NEW.organization_id,
        'title', NEW.title,
        'title_en', NEW.title_en,
        'category', NEW.category,
        'xp_reward', NEW.xp_reward,
        'difficulty', NEW.difficulty
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_challenge ON challenges;
CREATE TRIGGER trigger_notify_new_challenge
  AFTER UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_challenge();

-- ============================================================================
-- 3. TRIGGER: notify_level_up
-- Fires when a user's level increases
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get level values (handle NULL for old records)
  v_old_level := COALESCE(OLD.level, 1);
  v_new_level := COALESCE(NEW.level, 1);

  -- Only fire when level increases
  IF v_new_level > v_old_level THEN

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      v_payload := jsonb_build_object(
        'type', 'level_up',
        'user_id', NEW.id,
        'old_level', v_old_level,
        'new_level', v_new_level,
        'total_xp', NEW.total_xp
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_level_up ON users;
CREATE TRIGGER trigger_notify_level_up
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_level_up();

-- ============================================================================
-- 4. TRIGGER: notify_badge_earned
-- Fires when a user earns a new badge
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_badge_record RECORD;
BEGIN
  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    -- Get badge details
    SELECT id, name, name_en, description, description_en, icon, category
    INTO v_badge_record
    FROM badges
    WHERE id = NEW.badge_id;

    v_payload := jsonb_build_object(
      'type', 'badge_earned',
      'user_id', NEW.user_id,
      'badge_id', NEW.badge_id,
      'badge_name', v_badge_record.name,
      'badge_name_en', v_badge_record.name_en,
      'badge_icon', v_badge_record.icon,
      'badge_category', v_badge_record.category,
      'earned_at', NEW.earned_at
    );

    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := v_payload
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_badge_earned ON user_badges;
CREATE TRIGGER trigger_notify_badge_earned
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION notify_badge_earned();

-- ============================================================================
-- 5. TRIGGER: notify_ngo_new_participant
-- Fires when a new submission is created (new participant joined a challenge)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_ngo_new_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_challenge_record RECORD;
  v_user_record RECORD;
BEGIN
  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    -- Get challenge details
    SELECT id, title, title_en, organization_id
    INTO v_challenge_record
    FROM challenges
    WHERE id = NEW.challenge_id;

    -- Get user details
    SELECT id, display_name, avatar_url
    INTO v_user_record
    FROM users
    WHERE id = NEW.user_id;

    v_payload := jsonb_build_object(
      'type', 'ngo_new_participant',
      'submission_id', NEW.id,
      'challenge_id', NEW.challenge_id,
      'challenge_title', v_challenge_record.title,
      'challenge_title_en', v_challenge_record.title_en,
      'organization_id', v_challenge_record.organization_id,
      'user_id', NEW.user_id,
      'user_display_name', v_user_record.display_name,
      'user_avatar_url', v_user_record.avatar_url,
      'joined_at', NEW.created_at
    );

    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := v_payload
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_ngo_new_participant ON submissions;
CREATE TRIGGER trigger_notify_ngo_new_participant
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_ngo_new_participant();

-- ============================================================================
-- 6. TRIGGER: notify_ngo_proof_submitted
-- Fires when a submission status changes to 'submitted' (proof uploaded)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_ngo_proof_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_challenge_record RECORD;
  v_user_record RECORD;
BEGIN
  -- Only fire when status changes to submitted
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'submitted' THEN

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      -- Get challenge details
      SELECT id, title, title_en, organization_id
      INTO v_challenge_record
      FROM challenges
      WHERE id = NEW.challenge_id;

      -- Get user details
      SELECT id, display_name, avatar_url
      INTO v_user_record
      FROM users
      WHERE id = NEW.user_id;

      v_payload := jsonb_build_object(
        'type', 'ngo_proof_submitted',
        'submission_id', NEW.id,
        'challenge_id', NEW.challenge_id,
        'challenge_title', v_challenge_record.title,
        'challenge_title_en', v_challenge_record.title_en,
        'organization_id', v_challenge_record.organization_id,
        'user_id', NEW.user_id,
        'user_display_name', v_user_record.display_name,
        'proof_url', NEW.proof_url,
        'proof_text', NEW.proof_text,
        'submitted_at', NEW.submitted_at
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_ngo_proof_submitted ON submissions;
CREATE TRIGGER trigger_notify_ngo_proof_submitted
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_ngo_proof_submitted();

-- ============================================================================
-- 7. TRIGGER: notify_org_verification_push
-- Fires when an organization's verification_status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_org_verification_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
BEGIN
  -- Only fire when verification_status changes
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      v_payload := jsonb_build_object(
        'type', 'org_verification_status_changed',
        'organization_id', NEW.id,
        'organization_name', NEW.name,
        'old_status', OLD.verification_status,
        'new_status', NEW.verification_status,
        'owner_id', NEW.owner_id,
        'updated_at', NEW.updated_at
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_org_verification_push ON organizations;
CREATE TRIGGER trigger_notify_org_verification_push
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION notify_org_verification_push();

-- ============================================================================
-- 8. TRIGGER: notify_post_comment
-- Fires when a new comment is added to a community post
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_post_record RECORD;
  v_commenter_record RECORD;
BEGIN
  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    -- Get post details
    SELECT id, user_id, content
    INTO v_post_record
    FROM community_posts
    WHERE id = NEW.post_id;

    -- Don't notify if the commenter is the post author
    IF v_post_record.user_id != NEW.user_id THEN
      -- Get commenter details
      SELECT id, display_name, avatar_url
      INTO v_commenter_record
      FROM users
      WHERE id = NEW.user_id;

      v_payload := jsonb_build_object(
        'type', 'post_comment',
        'comment_id', NEW.id,
        'post_id', NEW.post_id,
        'post_author_id', v_post_record.user_id,
        'commenter_id', NEW.user_id,
        'commenter_display_name', v_commenter_record.display_name,
        'commenter_avatar_url', v_commenter_record.avatar_url,
        'comment_content', LEFT(NEW.content, 200),
        'commented_at', NEW.created_at
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_post_comment ON community_comments;
CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();

-- ============================================================================
-- 9. TRIGGER: notify_post_like
-- Fires when a user likes a community post
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
  v_payload JSONB;
  v_post_record RECORD;
  v_liker_record RECORD;
BEGIN
  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    -- Get post details
    SELECT id, user_id, content
    INTO v_post_record
    FROM community_posts
    WHERE id = NEW.post_id;

    -- Don't notify if the liker is the post author
    IF v_post_record.user_id != NEW.user_id THEN
      -- Get liker details
      SELECT id, display_name, avatar_url
      INTO v_liker_record
      FROM users
      WHERE id = NEW.user_id;

      v_payload := jsonb_build_object(
        'type', 'post_like',
        'like_id', NEW.id,
        'post_id', NEW.post_id,
        'post_author_id', v_post_record.user_id,
        'liker_id', NEW.user_id,
        'liker_display_name', v_liker_record.display_name,
        'liker_avatar_url', v_liker_record.avatar_url,
        'liked_at', NEW.created_at
      );

      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := v_payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_post_like ON community_likes;
CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_like();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION notify_submission_reviewed() IS 'Sends push notification when a submission is approved or rejected';
COMMENT ON FUNCTION notify_new_challenge() IS 'Sends push notification when a new challenge becomes active';
COMMENT ON FUNCTION notify_level_up() IS 'Sends push notification when a user levels up';
COMMENT ON FUNCTION notify_badge_earned() IS 'Sends push notification when a user earns a new badge';
COMMENT ON FUNCTION notify_ngo_new_participant() IS 'Sends push notification to NGO when a new participant joins a challenge';
COMMENT ON FUNCTION notify_ngo_proof_submitted() IS 'Sends push notification to NGO when proof is submitted for review';
COMMENT ON FUNCTION notify_org_verification_push() IS 'Sends push notification when organization verification status changes';
COMMENT ON FUNCTION notify_post_comment() IS 'Sends push notification when someone comments on a community post';
COMMENT ON FUNCTION notify_post_like() IS 'Sends push notification when someone likes a community post';
