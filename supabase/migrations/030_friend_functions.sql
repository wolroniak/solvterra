-- Migration: 030_friend_functions.sql
-- Helper functions for friend suggestions and friend list

-- Get friend suggestions based on shared completed challenges
CREATE OR REPLACE FUNCTION get_friend_suggestions(requesting_user_id UUID, limit_count INT DEFAULT 5)
RETURNS TABLE(
  id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  shared_challenges BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.username,
    u.avatar,
    u.level,
    COUNT(*)::BIGINT as shared_challenges
  FROM users u
  JOIN submissions s ON s.user_id = u.id AND s.status = 'approved'
  WHERE s.challenge_id IN (
    SELECT challenge_id FROM submissions
    WHERE user_id = requesting_user_id AND status = 'approved'
  )
  AND u.id != requesting_user_id
  AND u.id NOT IN (
    SELECT addressee_id FROM friendships WHERE requester_id = requesting_user_id
  )
  AND u.id NOT IN (
    SELECT requester_id FROM friendships WHERE addressee_id = requesting_user_id
  )
  GROUP BY u.id, u.name, u.username, u.avatar, u.level
  ORDER BY shared_challenges DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get accepted friends list
CREATE OR REPLACE FUNCTION get_friends(requesting_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  friendship_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.username,
    u.avatar,
    u.level,
    f.id as friendship_id
  FROM users u
  JOIN friendships f ON (
    (f.requester_id = requesting_user_id AND f.addressee_id = u.id) OR
    (f.addressee_id = requesting_user_id AND f.requester_id = u.id)
  )
  WHERE f.status = 'accepted'
  ORDER BY u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending friend requests (incoming)
CREATE OR REPLACE FUNCTION get_pending_friend_requests(requesting_user_id UUID)
RETURNS TABLE(
  friendship_id UUID,
  user_id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id as friendship_id,
    u.id as user_id,
    u.name,
    u.username,
    u.avatar,
    u.level,
    f.created_at
  FROM friendships f
  JOIN users u ON f.requester_id = u.id
  WHERE f.addressee_id = requesting_user_id
    AND f.status = 'pending'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search users by username
CREATE OR REPLACE FUNCTION search_users_by_username(search_query TEXT, requesting_user_id UUID, limit_count INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  level INT,
  friendship_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.username,
    u.avatar,
    u.level,
    COALESCE(
      (SELECT f.status FROM friendships f
       WHERE (f.requester_id = requesting_user_id AND f.addressee_id = u.id)
          OR (f.addressee_id = requesting_user_id AND f.requester_id = u.id)
       LIMIT 1),
      'none'
    ) as friendship_status
  FROM users u
  WHERE u.id != requesting_user_id
    AND (u.username ILIKE '%' || search_query || '%' OR u.name ILIKE '%' || search_query || '%')
  ORDER BY
    CASE WHEN u.username ILIKE search_query || '%' THEN 0 ELSE 1 END,
    u.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
