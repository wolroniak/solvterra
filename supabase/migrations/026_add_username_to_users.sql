-- Migration: 026_add_username_to_users.sql
-- Add username column for friend search

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Generate default usernames for existing users (based on name, lowercased, spaces to underscores)
UPDATE users
SET username = LOWER(REGEXP_REPLACE(name, '\s+', '_', 'g')) || '_' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;
