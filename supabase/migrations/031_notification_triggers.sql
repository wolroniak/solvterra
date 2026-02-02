-- Migration: 031_notification_triggers.sql
-- Auto-create notifications for friend/team events

-- Friend request notification
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
BEGIN
  SELECT name INTO requester_name FROM users WHERE id = NEW.requester_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.addressee_id,
    'friend_request',
    'Neue Freundschaftsanfrage',
    requester_name || ' möchte dein Freund sein',
    jsonb_build_object('friendshipId', NEW.id, 'requesterId', NEW.requester_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_friend_request_notification
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- Friend accepted notification
CREATE OR REPLACE FUNCTION notify_friend_accepted()
RETURNS TRIGGER AS $$
DECLARE
  accepter_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT name INTO accepter_name FROM users WHERE id = NEW.addressee_id;

    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      NEW.requester_id,
      'friend_accepted',
      'Anfrage akzeptiert',
      accepter_name || ' hat deine Anfrage akzeptiert',
      jsonb_build_object('friendshipId', NEW.id, 'friendId', NEW.addressee_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_friend_accepted_notification
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_accepted();

-- Team invite notification
CREATE OR REPLACE FUNCTION notify_team_invite()
RETURNS TRIGGER AS $$
DECLARE
  inviter_name TEXT;
  challenge_title TEXT;
  challenge_id_val UUID;
BEGIN
  IF NEW.role = 'creator' THEN
    RETURN NEW;
  END IF;

  SELECT u.name, c.title, c.id INTO inviter_name, challenge_title, challenge_id_val
  FROM teams t
  JOIN users u ON t.creator_id = u.id
  JOIN challenges c ON t.challenge_id = c.id
  WHERE t.id = NEW.team_id;

  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user_id,
    'team_invite',
    'Team-Einladung',
    inviter_name || ' lädt dich zu "' || challenge_title || '" ein',
    jsonb_build_object('teamId', NEW.team_id, 'challengeId', challenge_id_val)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_team_invite_notification
  AFTER INSERT ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_team_invite();

-- Team activation trigger (when min size reached)
CREATE OR REPLACE FUNCTION check_team_activation()
RETURNS TRIGGER AS $$
DECLARE
  accepted_count INT;
  min_size INT;
  team_record RECORD;
BEGIN
  IF NEW.status != 'accepted' THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO accepted_count
  FROM team_members
  WHERE team_id = NEW.team_id AND status = 'accepted';

  SELECT t.*, c.min_team_size, c.id as challenge_id INTO team_record
  FROM teams t
  JOIN challenges c ON t.challenge_id = c.id
  WHERE t.id = NEW.team_id;

  min_size := COALESCE(team_record.min_team_size, 2);

  IF accepted_count >= min_size AND team_record.status = 'forming' THEN
    UPDATE teams
    SET status = 'active', activated_at = now()
    WHERE id = NEW.team_id;

    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
      tm.user_id,
      'team_activated',
      'Team bereit!',
      'Dein Team ist startklar',
      jsonb_build_object('teamId', NEW.team_id, 'challengeId', team_record.challenge_id)
    FROM team_members tm
    WHERE tm.team_id = NEW.team_id AND tm.status = 'accepted';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_team_activation
  AFTER UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION check_team_activation();

-- Team bonus trigger (when all members complete)
CREATE OR REPLACE FUNCTION check_team_bonus()
RETURNS TRIGGER AS $$
DECLARE
  team_record RECORD;
  accepted_members INT;
  approved_submissions INT;
  bonus_xp INT;
BEGIN
  IF NEW.team_id IS NULL OR NEW.status != 'approved' THEN
    RETURN NEW;
  END IF;

  SELECT t.*, c.xp_reward INTO team_record
  FROM teams t
  JOIN challenges c ON t.challenge_id = c.id
  WHERE t.id = NEW.team_id;

  IF team_record.status != 'active' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO accepted_members
  FROM team_members
  WHERE team_id = NEW.team_id AND status = 'accepted';

  SELECT COUNT(*) INTO approved_submissions
  FROM submissions
  WHERE team_id = NEW.team_id AND status = 'approved';

  IF approved_submissions = accepted_members THEN
    bonus_xp := ROUND(team_record.xp_reward * 0.2);

    UPDATE users
    SET xp = xp + bonus_xp
    WHERE id IN (
      SELECT user_id FROM team_members
      WHERE team_id = NEW.team_id AND status = 'accepted'
    );

    UPDATE teams SET status = 'completed' WHERE id = NEW.team_id;

    INSERT INTO notifications (user_id, type, title, body, data)
    SELECT
      tm.user_id,
      'team_bonus',
      'Team-Bonus!',
      '+' || bonus_xp || ' XP Bonus verdient!',
      jsonb_build_object('teamId', NEW.team_id, 'bonusXp', bonus_xp)
    FROM team_members tm
    WHERE tm.team_id = NEW.team_id AND tm.status = 'accepted';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_team_bonus
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_team_bonus();
