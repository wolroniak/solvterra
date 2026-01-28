-- Migration: Create increment_participants RPC
-- Atomically increments current_participants on a challenge

CREATE OR REPLACE FUNCTION increment_participants(challenge_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE challenges
  SET current_participants = current_participants + 1
  WHERE id = challenge_uuid;
END;
$$;
