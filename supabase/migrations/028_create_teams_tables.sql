-- Migration: 028_create_teams_tables.sql
-- Team formation for multi-person challenges

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('forming', 'active', 'completed')) DEFAULT 'forming',
  created_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ
);

CREATE INDEX idx_teams_challenge ON teams(challenge_id);
CREATE INDEX idx_teams_creator ON teams(creator_id);
CREATE INDEX idx_teams_status ON teams(status);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    creator_id = auth.uid() OR
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = creator_id);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('creator', 'member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('invited', 'accepted', 'declined')) DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check team membership (bypasses RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION is_user_team_member(check_team_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = check_team_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_user_team_member(team_id, auth.uid())
  );

CREATE POLICY "Team creators can invite members" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE creator_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their own membership" ON team_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Add team_id to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_id);
