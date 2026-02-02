# Friend System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement friend management and team challenges with real database persistence, replacing mock data.

**Architecture:** Supabase tables for friendships, teams, team_members, and notifications with RLS policies. Zustand stores for client state. UI integrated into existing Community tab header.

**Tech Stack:** Supabase (PostgreSQL), Zustand 5, React Native Paper, Expo Router, i18next

---

## Phase 1: Database Foundation

### Task 1: Add Username to Users Table

**Files:**
- Create: `supabase/migrations/026_add_username_to_users.sql`

**Step 1: Write the migration**

```sql
-- Migration: 026_add_username_to_users.sql
-- Add username column for friend search

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Generate default usernames for existing users (based on name, lowercased, spaces to underscores)
UPDATE users
SET username = LOWER(REGEXP_REPLACE(name, '\s+', '_', 'g')) || '_' || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;
```

**Step 2: Apply migration**

Run: `npx supabase db push` or apply via Supabase dashboard

**Step 3: Commit**

```bash
git add supabase/migrations/026_add_username_to_users.sql
git commit -m "feat(db): add username column to users table"
```

---

### Task 2: Create Friendships Table

**Files:**
- Create: `supabase/migrations/027_create_friendships_table.sql`

**Step 1: Write the migration**

```sql
-- Migration: 027_create_friendships_table.sql
-- Bidirectional friendship system with request/accept flow

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- RLS Policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friend requests" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of" ON friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own friendships" ON friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/027_create_friendships_table.sql
git commit -m "feat(db): create friendships table with RLS"
```

---

### Task 3: Create Teams and Team Members Tables

**Files:**
- Create: `supabase/migrations/028_create_teams_tables.sql`

**Step 1: Write the migration**

```sql
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

CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members tm WHERE tm.user_id = auth.uid())
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
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/028_create_teams_tables.sql
git commit -m "feat(db): create teams and team_members tables"
```

---

### Task 4: Create Notifications Table

**Files:**
- Create: `supabase/migrations/029_create_notifications_table.sql`

**Step 1: Write the migration**

```sql
-- Migration: 029_create_notifications_table.sql
-- In-app notifications for friend requests, team invites, etc.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('friend_request', 'friend_accepted', 'team_invite', 'team_activated', 'team_bonus')) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/029_create_notifications_table.sql
git commit -m "feat(db): create notifications table"
```

---

### Task 5: Create Database Functions

**Files:**
- Create: `supabase/migrations/030_friend_functions.sql`

**Step 1: Write the migration**

```sql
-- Migration: 030_friend_functions.sql
-- Helper functions for friend suggestions and friend list

-- Get friend suggestions based on shared completed challenges
CREATE OR REPLACE FUNCTION get_friend_suggestions(requesting_user_id UUID, limit_count INT DEFAULT 5)
RETURNS TABLE(
  id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  level TEXT,
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
  level TEXT,
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
  level TEXT,
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
  level TEXT,
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
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/030_friend_functions.sql
git commit -m "feat(db): add friend helper functions"
```

---

### Task 6: Create Notification Triggers

**Files:**
- Create: `supabase/migrations/031_notification_triggers.sql`

**Step 1: Write the migration**

```sql
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
  -- Only notify for invited members, not the creator
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
```

**Step 2: Apply migration**

Run: `npx supabase db push`

**Step 3: Commit**

```bash
git add supabase/migrations/031_notification_triggers.sql
git commit -m "feat(db): add notification triggers for friends and teams"
```

---

## Phase 2: Shared Types

### Task 7: Add Friend and Team Types to Shared Package

**Files:**
- Modify: `packages/shared/src/types/index.ts`

**Step 1: Add new types at end of file**

Add after line ~500 (after existing Friend interface):

```typescript
// ============================================
// FRIENDSHIP SYSTEM
// ============================================

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'none';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface FriendRequest {
  friendshipId: string;
  user: {
    id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    level: UserLevel;
  };
  createdAt: Date;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  level: UserLevel;
  sharedChallenges: number;
}

export interface FriendListItem {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  level: UserLevel;
  friendshipId: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  level: UserLevel;
  friendshipStatus: FriendshipStatus;
}

// ============================================
// TEAM SYSTEM
// ============================================

export type TeamStatus = 'forming' | 'active' | 'completed';
export type TeamMemberRole = 'creator' | 'member';
export type TeamMemberStatus = 'invited' | 'accepted' | 'declined';

export interface Team {
  id: string;
  challengeId: string;
  creatorId: string;
  status: TeamStatus;
  createdAt: Date;
  activatedAt?: Date;
  members?: TeamMember[];
  challenge?: Challenge;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invitedAt: Date;
  acceptedAt?: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
    level: UserLevel;
  };
  submission?: Submission;
}

// ============================================
// APP NOTIFICATIONS (In-app, not push)
// ============================================

export type AppNotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'team_invite'
  | 'team_activated'
  | 'team_bonus';

export interface AppNotification {
  id: string;
  userId: string;
  type: AppNotificationType;
  title: string;
  body?: string;
  data?: {
    friendshipId?: string;
    requesterId?: string;
    friendId?: string;
    teamId?: string;
    challengeId?: string;
    bonusXp?: number;
  };
  read: boolean;
  createdAt: Date;
}
```

**Step 2: Export new types**

Types are exported automatically via the `export` keyword.

**Step 3: Commit**

```bash
git add packages/shared/src/types/index.ts
git commit -m "feat(types): add friendship, team, and notification types"
```

---

## Phase 3: Friend Store

### Task 8: Create Friend Store

**Files:**
- Create: `apps/mobile/store/friendStore.ts`

**Step 1: Create the store file**

```typescript
// Friend State Store
// Manages friendships, requests, and suggestions

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
  FriendListItem,
  FriendRequest,
  FriendSuggestion,
  UserSearchResult
} from '@solvterra/shared';

interface FriendState {
  friends: FriendListItem[];
  pendingRequests: FriendRequest[];
  suggestions: FriendSuggestion[];
  isLoading: boolean;
  error: string | null;

  // Fetch actions
  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;

  // Friend request actions
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  declineRequest: (friendshipId: string) => Promise<boolean>;
  unfriend: (friendshipId: string) => Promise<boolean>;

  // Search
  searchUsers: (query: string) => Promise<UserSearchResult[]>;

  // Counts
  getPendingCount: () => number;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  suggestions: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase.rpc('get_friends', {
        requesting_user_id: user.id,
      });

      if (error) throw error;

      const friends: FriendListItem[] = (data || []).map((f: Record<string, unknown>) => ({
        id: f.id as string,
        name: f.name as string,
        username: f.username as string | undefined,
        avatarUrl: f.avatar_url as string | undefined,
        level: f.level as FriendListItem['level'],
        friendshipId: f.friendship_id as string,
      }));

      set({ friends, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      set({ error: 'Failed to load friends', isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_pending_friend_requests', {
        requesting_user_id: user.id,
      });

      if (error) throw error;

      const requests: FriendRequest[] = (data || []).map((r: Record<string, unknown>) => ({
        friendshipId: r.friendship_id as string,
        user: {
          id: r.user_id as string,
          name: r.name as string,
          username: r.username as string | undefined,
          avatarUrl: r.avatar_url as string | undefined,
          level: r.level as FriendRequest['user']['level'],
        },
        createdAt: new Date(r.created_at as string),
      }));

      set({ pendingRequests: requests });
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  },

  fetchSuggestions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_friend_suggestions', {
        requesting_user_id: user.id,
        limit_count: 5,
      });

      if (error) throw error;

      const suggestions: FriendSuggestion[] = (data || []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        name: s.name as string,
        username: s.username as string | undefined,
        avatarUrl: s.avatar_url as string | undefined,
        level: s.level as FriendSuggestion['level'],
        sharedChallenges: Number(s.shared_challenges),
      }));

      set({ suggestions });
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  },

  sendFriendRequest: async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: userId,
        status: 'pending',
      });

      if (error) throw error;

      // Refresh suggestions to remove the user we just sent a request to
      get().fetchSuggestions();
      return true;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      return false;
    }
  },

  acceptRequest: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;

      // Refresh both lists
      await Promise.all([
        get().fetchFriends(),
        get().fetchPendingRequests(),
      ]);
      return true;
    } catch (error) {
      console.error('Failed to accept request:', error);
      return false;
    }
  },

  declineRequest: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendshipId);

      if (error) throw error;

      get().fetchPendingRequests();
      return true;
    } catch (error) {
      console.error('Failed to decline request:', error);
      return false;
    }
  },

  unfriend: async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      get().fetchFriends();
      return true;
    } catch (error) {
      console.error('Failed to unfriend:', error);
      return false;
    }
  },

  searchUsers: async (query: string) => {
    if (query.length < 2) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('search_users_by_username', {
        search_query: query,
        requesting_user_id: user.id,
        limit_count: 10,
      });

      if (error) throw error;

      return (data || []).map((u: Record<string, unknown>) => ({
        id: u.id as string,
        name: u.name as string,
        username: u.username as string | undefined,
        avatarUrl: u.avatar_url as string | undefined,
        level: u.level as UserSearchResult['level'],
        friendshipStatus: u.friendship_status as UserSearchResult['friendshipStatus'],
      }));
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },

  getPendingCount: () => {
    return get().pendingRequests.length;
  },
}));
```

**Step 2: Export from store index**

Add to `apps/mobile/store/index.ts`:

```typescript
export { useFriendStore } from './friendStore';
```

**Step 3: Commit**

```bash
git add apps/mobile/store/friendStore.ts apps/mobile/store/index.ts
git commit -m "feat(mobile): add friendStore with Supabase integration"
```

---

### Task 9: Create Notification Store

**Files:**
- Create: `apps/mobile/store/notificationStore.ts`

**Step 1: Create the store file**

```typescript
// Notification State Store
// Manages in-app notifications

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AppNotification } from '@solvterra/shared';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => () => void;
}

let subscription: RealtimeChannel | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications: AppNotification[] = (data || []).map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        read: n.read,
        createdAt: new Date(n.created_at),
      }));

      const unreadCount = notifications.filter(n => !n.read).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  subscribeToNotifications: () => {
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clean up existing subscription
      if (subscription) {
        subscription.unsubscribe();
      }

      subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as Record<string, unknown>;
            const notification: AppNotification = {
              id: n.id as string,
              userId: n.user_id as string,
              type: n.type as AppNotification['type'],
              title: n.title as string,
              body: n.body as string | undefined,
              data: n.data as AppNotification['data'],
              read: n.read as boolean,
              createdAt: new Date(n.created_at as string),
            };

            set(state => ({
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));
          }
        )
        .subscribe();
    };

    subscribe();

    // Return cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  },
}));
```

**Step 2: Export from store index**

Add to `apps/mobile/store/index.ts`:

```typescript
export { useNotificationStore } from './notificationStore';
```

**Step 3: Commit**

```bash
git add apps/mobile/store/notificationStore.ts apps/mobile/store/index.ts
git commit -m "feat(mobile): add notificationStore with realtime subscription"
```

---

## Phase 4: i18n Strings

### Task 10: Add Friend System Translations

**Files:**
- Create: `apps/mobile/i18n/locales/de/friends.json`
- Create: `apps/mobile/i18n/locales/en/friends.json`

**Step 1: Create German translations**

```json
{
  "title": "Freunde",
  "search": {
    "title": "Freunde suchen",
    "placeholder": "Nutzername suchen...",
    "noResults": "Keine Nutzer gefunden",
    "minChars": "Mindestens 2 Zeichen eingeben"
  },
  "sections": {
    "requests": "Anfragen",
    "suggestions": "Vorschläge",
    "friends": "Meine Freunde"
  },
  "suggestion": {
    "sharedChallenges": "{{count}} gemeinsame Challenges"
  },
  "actions": {
    "add": "Hinzufügen",
    "accept": "Annehmen",
    "decline": "Ablehnen",
    "unfriend": "Entfernen",
    "requestSent": "Anfrage gesendet"
  },
  "empty": {
    "requests": "Keine ausstehenden Anfragen",
    "suggestions": "Keine Vorschläge verfügbar",
    "friends": "Du hast noch keine Freunde",
    "friendsHint": "Suche nach Nutzern oder schließe Challenges ab, um Vorschläge zu erhalten"
  },
  "notifications": {
    "title": "Benachrichtigungen",
    "markAllRead": "Alle als gelesen markieren",
    "empty": "Keine Benachrichtigungen",
    "today": "Heute",
    "yesterday": "Gestern",
    "thisWeek": "Diese Woche",
    "older": "Älter"
  },
  "team": {
    "invite": "Team-Einladung",
    "members": "{{current}}/{{max}} Mitglieder",
    "endsIn": "Endet in {{days}} Tagen",
    "accept": "Beitreten",
    "decline": "Ablehnen",
    "status": {
      "forming": "Team wird gebildet",
      "active": "Team aktiv",
      "completed": "Abgeschlossen"
    },
    "yourTeam": "Dein Team",
    "completedCount": "{{completed}}/{{total}} abgeschlossen",
    "bonusHint": "Schließt als Team ab für +20% XP Bonus!",
    "bonusEarned": "Team-Bonus freigeschaltet: +{{xp}} XP!"
  }
}
```

**Step 2: Create English translations**

```json
{
  "title": "Friends",
  "search": {
    "title": "Search Friends",
    "placeholder": "Search by username...",
    "noResults": "No users found",
    "minChars": "Enter at least 2 characters"
  },
  "sections": {
    "requests": "Requests",
    "suggestions": "Suggestions",
    "friends": "My Friends"
  },
  "suggestion": {
    "sharedChallenges": "{{count}} shared challenges"
  },
  "actions": {
    "add": "Add",
    "accept": "Accept",
    "decline": "Decline",
    "unfriend": "Remove",
    "requestSent": "Request sent"
  },
  "empty": {
    "requests": "No pending requests",
    "suggestions": "No suggestions available",
    "friends": "You don't have any friends yet",
    "friendsHint": "Search for users or complete challenges to get suggestions"
  },
  "notifications": {
    "title": "Notifications",
    "markAllRead": "Mark all as read",
    "empty": "No notifications",
    "today": "Today",
    "yesterday": "Yesterday",
    "thisWeek": "This Week",
    "older": "Older"
  },
  "team": {
    "invite": "Team Invitation",
    "members": "{{current}}/{{max}} members",
    "endsIn": "Ends in {{days}} days",
    "accept": "Join",
    "decline": "Decline",
    "status": {
      "forming": "Team forming",
      "active": "Team active",
      "completed": "Completed"
    },
    "yourTeam": "Your Team",
    "completedCount": "{{completed}}/{{total}} completed",
    "bonusHint": "Complete as a team for +20% XP bonus!",
    "bonusEarned": "Team bonus unlocked: +{{xp}} XP!"
  }
}
```

**Step 3: Register namespace in i18n config**

Add 'friends' to the namespace list in `apps/mobile/i18n/index.ts` (if separate namespace loading is used).

**Step 4: Commit**

```bash
git add apps/mobile/i18n/locales/de/friends.json apps/mobile/i18n/locales/en/friends.json
git commit -m "feat(i18n): add friend system translations"
```

---

## Phase 5: UI Components

### Task 11: Create FriendRequestCard Component

**Files:**
- Create: `apps/mobile/components/FriendRequestCard.tsx`

**Step 1: Create the component**

```typescript
// FriendRequestCard Component
// Displays a pending friend request with accept/decline buttons

import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendRequest } from '@solvterra/shared';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
  isLoading?: boolean;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

export default function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  isLoading,
}: FriendRequestCardProps) {
  return (
    <View style={styles.container}>
      {request.user.avatarUrl ? (
        <Image source={{ uri: request.user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={24} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{request.user.name}</Text>
        {request.user.username && (
          <Text style={styles.username}>@{request.user.username}</Text>
        )}
        <View style={styles.levelRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(request.user.level) }]} />
          <Text style={styles.levelText}>
            {request.user.level.charAt(0).toUpperCase() + request.user.level.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => onAccept(request.friendshipId)}
          loading={isLoading}
          disabled={isLoading}
          compact
          style={styles.acceptButton}
          labelStyle={styles.buttonLabel}
        >
          <MaterialCommunityIcons name="check" size={18} color="#fff" />
        </Button>
        <Button
          mode="outlined"
          onPress={() => onDecline(request.friendshipId)}
          disabled={isLoading}
          compact
          style={styles.declineButton}
          labelStyle={styles.buttonLabel}
        >
          <MaterialCommunityIcons name="close" size={18} color={Colors.neutral[600]} />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  username: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  levelText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary[600],
    minWidth: 44,
  },
  declineButton: {
    borderColor: Colors.neutral[300],
    minWidth: 44,
  },
  buttonLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/FriendRequestCard.tsx
git commit -m "feat(mobile): add FriendRequestCard component"
```

---

### Task 12: Create FriendSuggestionCard Component

**Files:**
- Create: `apps/mobile/components/FriendSuggestionCard.tsx`

**Step 1: Create the component**

```typescript
// FriendSuggestionCard Component
// Displays a friend suggestion with shared challenge count

import { useState } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendSuggestion } from '@solvterra/shared';

interface FriendSuggestionCardProps {
  suggestion: FriendSuggestion;
  onAdd: (userId: string) => Promise<boolean>;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

export default function FriendSuggestionCard({
  suggestion,
  onAdd,
}: FriendSuggestionCardProps) {
  const { t } = useTranslation('friends');
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    const success = await onAdd(suggestion.id);
    setIsAdding(false);
    if (success) {
      setAdded(true);
    }
  };

  return (
    <View style={styles.container}>
      {suggestion.avatarUrl ? (
        <Image source={{ uri: suggestion.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={24} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{suggestion.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(suggestion.level) }]} />
          <Text style={styles.sharedText}>
            {t('suggestion.sharedChallenges', { count: suggestion.sharedChallenges })}
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.addButton,
          added && styles.addedButton,
          isAdding && styles.addingButton,
        ]}
        onPress={handleAdd}
        disabled={added || isAdding}
      >
        {added ? (
          <MaterialCommunityIcons name="check" size={20} color={Colors.primary[600]} />
        ) : (
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={isAdding ? Colors.neutral[400] : Colors.primary[600]}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sharedText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  addedButton: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[300],
  },
  addingButton: {
    opacity: 0.5,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/FriendSuggestionCard.tsx
git commit -m "feat(mobile): add FriendSuggestionCard component"
```

---

### Task 13: Create FriendListItem Component

**Files:**
- Create: `apps/mobile/components/FriendListItem.tsx`

**Step 1: Create the component**

```typescript
// FriendListItem Component
// Displays a friend in the friends list with unfriend action

import { View, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendListItem as FriendListItemType } from '@solvterra/shared';

interface FriendListItemProps {
  friend: FriendListItemType;
  onUnfriend: (friendshipId: string) => void;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

const getLevelLabel = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.label || level;
};

export default function FriendListItem({
  friend,
  onUnfriend,
}: FriendListItemProps) {
  const { t } = useTranslation('friends');

  const handleLongPress = () => {
    Alert.alert(
      friend.name,
      t('actions.unfriend') + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('actions.unfriend'),
          style: 'destructive',
          onPress: () => onUnfriend(friend.friendshipId),
        },
      ]
    );
  };

  return (
    <Pressable
      style={styles.container}
      onLongPress={handleLongPress}
      android_ripple={{ color: Colors.neutral[100] }}
    >
      {friend.avatarUrl ? (
        <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={22} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
        <View style={styles.levelRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(friend.level) }]} />
          <Text style={styles.levelText}>{getLevelLabel(friend.level)}</Text>
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.neutral[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  levelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  levelText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/FriendListItem.tsx
git commit -m "feat(mobile): add FriendListItem component"
```

---

### Task 14: Create FriendsScreen

**Files:**
- Create: `apps/mobile/app/friends.tsx`

**Step 1: Create the screen**

```typescript
// Friends Screen
// Displays pending requests, suggestions, and friend list

import { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useFriendStore } from '@/store';
import FriendRequestCard from '@/components/FriendRequestCard';
import FriendSuggestionCard from '@/components/FriendSuggestionCard';
import FriendListItem from '@/components/FriendListItem';
import type { FriendListItem as FriendListItemType, FriendRequest, FriendSuggestion, UserSearchResult } from '@solvterra/shared';

type SectionType = 'requests' | 'suggestions' | 'friends' | 'search';

interface Section {
  type: SectionType;
  title: string;
  data: FriendRequest[] | FriendSuggestion[] | FriendListItemType[] | UserSearchResult[];
}

export default function FriendsScreen() {
  const { t } = useTranslation('friends');
  const router = useRouter();

  const {
    friends,
    pendingRequests,
    suggestions,
    isLoading,
    fetchFriends,
    fetchPendingRequests,
    fetchSuggestions,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    unfriend,
    searchUsers,
  } = useFriendStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchSuggestions();
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchSuggestions(),
    ]);
    setRefreshing(false);
  }, []);

  const handleAddFromSearch = async (userId: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      // Update search results to show pending status
      setSearchResults(prev =>
        prev.map(u => u.id === userId ? { ...u, friendshipStatus: 'pending' as const } : u)
      );
    }
    return success;
  };

  const sections: Section[] = [];

  // Show search results if searching
  if (searchQuery.length >= 2) {
    sections.push({
      type: 'search',
      title: t('search.title'),
      data: searchResults,
    });
  } else {
    // Show normal sections
    if (pendingRequests.length > 0) {
      sections.push({
        type: 'requests',
        title: `${t('sections.requests')} (${pendingRequests.length})`,
        data: pendingRequests,
      });
    }

    if (suggestions.length > 0) {
      sections.push({
        type: 'suggestions',
        title: t('sections.suggestions'),
        data: suggestions,
      });
    }

    sections.push({
      type: 'friends',
      title: `${t('sections.friends')} (${friends.length})`,
      data: friends,
    });
  }

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderItem = ({ item, section }: { item: unknown; section: Section }) => {
    switch (section.type) {
      case 'requests':
        return (
          <FriendRequestCard
            request={item as FriendRequest}
            onAccept={acceptRequest}
            onDecline={declineRequest}
          />
        );
      case 'suggestions':
        return (
          <FriendSuggestionCard
            suggestion={item as FriendSuggestion}
            onAdd={sendFriendRequest}
          />
        );
      case 'friends':
        return (
          <FriendListItem
            friend={item as FriendListItemType}
            onUnfriend={unfriend}
          />
        );
      case 'search':
        const user = item as UserSearchResult;
        return (
          <FriendSuggestionCard
            suggestion={{
              ...user,
              sharedChallenges: 0,
            }}
            onAdd={handleAddFromSearch}
          />
        );
      default:
        return null;
    }
  };

  const renderEmpty = (type: SectionType) => {
    if (type === 'search' && isSearching) {
      return <Text style={styles.emptyText}>...</Text>;
    }
    if (type === 'search' && searchQuery.length >= 2) {
      return <Text style={styles.emptyText}>{t('search.noResults')}</Text>;
    }
    if (type === 'friends' && friends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={48} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>{t('empty.friends')}</Text>
          <Text style={styles.emptyHint}>{t('empty.friendsHint')}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t('title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('search.placeholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={Colors.neutral[400]}
        />
      </View>

      {/* Content */}
      <FlatList
        data={sections}
        keyExtractor={(section) => section.type}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            {renderSectionHeader(section.title)}
            {section.data.length === 0 ? (
              renderEmpty(section.type)
            ) : (
              section.data.map((item, index) => (
                <View key={index}>
                  {renderItem({ item, section })}
                </View>
              ))
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[600]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchbar: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/app/friends.tsx
git commit -m "feat(mobile): add FriendsScreen"
```

---

### Task 15: Create NotificationsScreen

**Files:**
- Create: `apps/mobile/app/notifications.tsx`

**Step 1: Create the screen**

```typescript
// Notifications Screen
// Activity feed showing friend requests, team invites, etc.

import { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useNotificationStore, useFriendStore } from '@/store';
import type { AppNotification } from '@solvterra/shared';

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'friend_request':
      return 'account-plus';
    case 'friend_accepted':
      return 'account-check';
    case 'team_invite':
      return 'account-group';
    case 'team_activated':
      return 'rocket-launch';
    case 'team_bonus':
      return 'star';
    default:
      return 'bell';
  }
};

const getNotificationColor = (type: AppNotification['type']) => {
  switch (type) {
    case 'friend_request':
    case 'friend_accepted':
      return Colors.secondary[500];
    case 'team_invite':
    case 'team_activated':
      return Colors.primary[600];
    case 'team_bonus':
      return '#f59e0b';
    default:
      return Colors.neutral[500];
  }
};

// Group notifications by date
const groupByDate = (notifications: AppNotification[]) => {
  const groups: { title: string; data: AppNotification[] }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayItems: AppNotification[] = [];
  const yesterdayItems: AppNotification[] = [];
  const thisWeekItems: AppNotification[] = [];
  const olderItems: AppNotification[] = [];

  notifications.forEach(n => {
    const date = new Date(n.createdAt);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      todayItems.push(n);
    } else if (date.getTime() === yesterday.getTime()) {
      yesterdayItems.push(n);
    } else if (date > weekAgo) {
      thisWeekItems.push(n);
    } else {
      olderItems.push(n);
    }
  });

  if (todayItems.length > 0) groups.push({ title: 'today', data: todayItems });
  if (yesterdayItems.length > 0) groups.push({ title: 'yesterday', data: yesterdayItems });
  if (thisWeekItems.length > 0) groups.push({ title: 'thisWeek', data: thisWeekItems });
  if (olderItems.length > 0) groups.push({ title: 'older', data: olderItems });

  return groups;
};

export default function NotificationsScreen() {
  const { t } = useTranslation('friends');
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const { acceptRequest, declineRequest } = useFriendStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.challengeId) {
      router.push(`/challenge/${notification.data.challengeId}`);
    } else if (notification.type === 'friend_request' || notification.type === 'friend_accepted') {
      router.push('/friends');
    }
  };

  const handleAcceptFriendRequest = async (notification: AppNotification) => {
    if (notification.data?.friendshipId) {
      await acceptRequest(notification.data.friendshipId);
      markAsRead(notification.id);
      fetchNotifications();
    }
  };

  const handleDeclineFriendRequest = async (notification: AppNotification) => {
    if (notification.data?.friendshipId) {
      await declineRequest(notification.data.friendshipId);
      markAsRead(notification.id);
      fetchNotifications();
    }
  };

  const groups = groupByDate(notifications);

  const renderNotification = (notification: AppNotification) => (
    <Pressable
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.read && styles.notificationUnread,
      ]}
      onPress={() => handlePress(notification)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
        <MaterialCommunityIcons
          name={getNotificationIcon(notification.type)}
          size={22}
          color={getNotificationColor(notification.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        {notification.body && (
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
        )}

        {/* Action buttons for friend requests */}
        {notification.type === 'friend_request' && !notification.read && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleAcceptFriendRequest(notification)}
              compact
              style={styles.acceptBtn}
            >
              {t('actions.accept')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeclineFriendRequest(notification)}
              compact
              style={styles.declineBtn}
            >
              {t('actions.decline')}
            </Button>
          </View>
        )}
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bell-outline" size={64} color={Colors.neutral[300]} />
      <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {notifications.length === 0 && !isLoading ? (
        renderEmpty()
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(group) => group.title}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>
                {t(`notifications.${group.title}`)}
              </Text>
              {group.data.map(renderNotification)}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary[600]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markAllButton: {
    padding: 4,
  },
  markAllText: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  group: {
    paddingTop: 16,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  notificationUnread: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: Colors.primary[600],
  },
  declineBtn: {
    borderColor: Colors.neutral[300],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/app/notifications.tsx
git commit -m "feat(mobile): add NotificationsScreen"
```

---

### Task 16: Update Community Tab Header with Icons

**Files:**
- Modify: `apps/mobile/app/(tabs)/community.tsx`

**Step 1: Add header icons**

Replace the titleBar View (around line 257-259) with:

```typescript
{/* Title Bar with Icons */}
<View style={styles.titleBar}>
  <Text style={styles.titleText}>Community</Text>
  <View style={styles.headerIcons}>
    <Pressable
      onPress={() => router.push('/notifications')}
      style={styles.headerIcon}
    >
      <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.textPrimary} />
      {unreadNotificationCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </Text>
        </View>
      )}
    </Pressable>
    <Pressable
      onPress={() => router.push('/friends')}
      style={styles.headerIcon}
    >
      <MaterialCommunityIcons name="account-group-outline" size={24} color={Colors.textPrimary} />
      {pendingRequestCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
          </Text>
        </View>
      )}
    </Pressable>
  </View>
</View>
```

**Step 2: Add imports and hooks**

Add to imports:

```typescript
import { useRouter } from 'expo-router';
import { useNotificationStore, useFriendStore } from '@/store';
```

Add inside component:

```typescript
const router = useRouter();
const { unreadCount: unreadNotificationCount } = useNotificationStore();
const { getPendingCount } = useFriendStore();
const pendingRequestCount = getPendingCount();

// Fetch on mount
useEffect(() => {
  useFriendStore.getState().fetchPendingRequests();
  useNotificationStore.getState().fetchNotifications();

  // Subscribe to realtime notifications
  const unsubscribe = useNotificationStore.getState().subscribeToNotifications();
  return unsubscribe;
}, []);
```

**Step 3: Add styles**

Add to styles:

```typescript
headerIcons: {
  flexDirection: 'row',
  gap: 8,
},
headerIcon: {
  padding: 6,
  position: 'relative',
},
badge: {
  position: 'absolute',
  top: 2,
  right: 2,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: Colors.accent[500],
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},
badgeText: {
  fontSize: 11,
  fontWeight: '700',
  color: '#fff',
},
```

Also update titleBar style to include:

```typescript
titleBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 0.5,
  borderBottomColor: Colors.neutral[200],
},
```

**Step 4: Commit**

```bash
git add apps/mobile/app/\(tabs\)/community.tsx
git commit -m "feat(mobile): add notification and friend icons to Community header"
```

---

## Phase 6: Team System

### Task 17: Create Team Store

**Files:**
- Create: `apps/mobile/store/teamStore.ts`

**Step 1: Create the store**

```typescript
// Team State Store
// Manages teams for multi-person challenges

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Team, TeamMember } from '@solvterra/shared';

interface TeamState {
  // Current user's teams
  myTeams: Team[];
  isLoading: boolean;

  // Actions
  fetchMyTeams: () => Promise<void>;
  getTeamForChallenge: (challengeId: string) => Team | undefined;

  // Team creation (called when inviting friends)
  createTeam: (challengeId: string, invitedUserIds: string[]) => Promise<Team | null>;

  // Team invite responses
  acceptTeamInvite: (teamId: string) => Promise<boolean>;
  declineTeamInvite: (teamId: string) => Promise<boolean>;

  // Get team members with details
  fetchTeamDetails: (teamId: string) => Promise<Team | null>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  myTeams: [],
  isLoading: false,

  fetchMyTeams: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Get teams where user is a member
      const { data: membershipData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!membershipData || membershipData.length === 0) {
        set({ myTeams: [], isLoading: false });
        return;
      }

      const teamIds = membershipData.map(m => m.team_id);

      // Fetch team details
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          challenge:challenges(id, title, title_en, deadline, min_team_size, max_team_size, xp_reward),
          members:team_members(
            id, user_id, role, status, invited_at, accepted_at,
            user:users(id, name, avatar, level)
          )
        `)
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      const teams: Team[] = (teamsData || []).map(t => ({
        id: t.id,
        challengeId: t.challenge_id,
        creatorId: t.creator_id,
        status: t.status,
        createdAt: new Date(t.created_at),
        activatedAt: t.activated_at ? new Date(t.activated_at) : undefined,
        challenge: t.challenge,
        members: t.members?.map((m: Record<string, unknown>) => ({
          id: m.id,
          teamId: t.id,
          userId: m.user_id,
          role: m.role,
          status: m.status,
          invitedAt: new Date(m.invited_at as string),
          acceptedAt: m.accepted_at ? new Date(m.accepted_at as string) : undefined,
          user: m.user,
        })),
      }));

      set({ myTeams: teams, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      set({ isLoading: false });
    }
  },

  getTeamForChallenge: (challengeId: string) => {
    return get().myTeams.find(t => t.challengeId === challengeId);
  },

  createTeam: async (challengeId: string, invitedUserIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          challenge_id: challengeId,
          creator_id: user.id,
          status: 'forming',
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as accepted member
      await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: user.id,
        role: 'creator',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      });

      // Add invited members
      if (invitedUserIds.length > 0) {
        const invites = invitedUserIds.map(userId => ({
          team_id: teamData.id,
          user_id: userId,
          role: 'member',
          status: 'invited',
        }));
        await supabase.from('team_members').insert(invites);
      }

      // Refresh teams
      await get().fetchMyTeams();

      return get().myTeams.find(t => t.id === teamData.id) || null;
    } catch (error) {
      console.error('Failed to create team:', error);
      return null;
    }
  },

  acceptTeamInvite: async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('team_members')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchMyTeams();
      return true;
    } catch (error) {
      console.error('Failed to accept team invite:', error);
      return false;
    }
  },

  declineTeamInvite: async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'declined' })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchMyTeams();
      return true;
    } catch (error) {
      console.error('Failed to decline team invite:', error);
      return false;
    }
  },

  fetchTeamDetails: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          challenge:challenges(id, title, title_en, deadline, min_team_size, max_team_size, xp_reward),
          members:team_members(
            id, user_id, role, status, invited_at, accepted_at,
            user:users(id, name, avatar, level),
            submission:submissions(id, status)
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        challengeId: data.challenge_id,
        creatorId: data.creator_id,
        status: data.status,
        createdAt: new Date(data.created_at),
        activatedAt: data.activated_at ? new Date(data.activated_at) : undefined,
        challenge: data.challenge,
        members: data.members?.map((m: Record<string, unknown>) => ({
          id: m.id,
          teamId: data.id,
          userId: m.user_id,
          role: m.role,
          status: m.status,
          invitedAt: new Date(m.invited_at as string),
          acceptedAt: m.accepted_at ? new Date(m.accepted_at as string) : undefined,
          user: m.user,
          submission: m.submission,
        })),
      } as Team;
    } catch (error) {
      console.error('Failed to fetch team details:', error);
      return null;
    }
  },
}));
```

**Step 2: Export from store index**

Add to `apps/mobile/store/index.ts`:

```typescript
export { useTeamStore } from './teamStore';
```

**Step 3: Commit**

```bash
git add apps/mobile/store/teamStore.ts apps/mobile/store/index.ts
git commit -m "feat(mobile): add teamStore for team challenges"
```

---

### Task 18: Update InviteFriendsModal to Use Real Data

**Files:**
- Modify: `apps/mobile/components/InviteFriendsModal.tsx`

**Step 1: Replace mock data with store**

Replace the imports and data source. Change:

```typescript
import { MOCK_FRIENDS, LEVELS } from '@solvterra/shared';
```

To:

```typescript
import { LEVELS } from '@solvterra/shared';
import { useFriendStore, useTeamStore } from '@/store';
```

**Step 2: Update component to fetch real friends**

Add hooks inside component:

```typescript
const { friends, fetchFriends, isLoading: isFriendsLoading } = useFriendStore();
const { createTeam } = useTeamStore();

useEffect(() => {
  if (visible) {
    fetchFriends();
  }
}, [visible]);
```

**Step 3: Replace MOCK_FRIENDS with friends from store**

In renderFriendItem and FlatList, use `friends` instead of `MOCK_FRIENDS`.

**Step 4: Update handleSendInvites to create real team**

```typescript
const handleSendInvites = async () => {
  setInviteSent(true);

  // Create team with selected friends
  const team = await createTeam(challenge.id, selectedFriends);

  if (team) {
    setTimeout(() => {
      onInviteComplete(selectedFriends);
    }, 1500);
  } else {
    // Handle error
    setInviteSent(false);
    Alert.alert('Fehler', 'Team konnte nicht erstellt werden');
  }
};
```

**Step 5: Commit**

```bash
git add apps/mobile/components/InviteFriendsModal.tsx
git commit -m "feat(mobile): update InviteFriendsModal to use real friends data"
```

---

### Task 19: Create TeamStatusSection Component

**Files:**
- Create: `apps/mobile/components/TeamStatusSection.tsx`

**Step 1: Create the component**

```typescript
// TeamStatusSection Component
// Displays team progress on challenge detail screen

import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import type { Team, TeamMember } from '@solvterra/shared';

interface TeamStatusSectionProps {
  team: Team;
  currentUserId: string;
}

const getStatusIcon = (member: TeamMember) => {
  if (member.submission?.status === 'approved') {
    return { name: 'check-circle', color: Colors.secondary[500] };
  }
  if (member.submission?.status === 'submitted') {
    return { name: 'clock-outline', color: Colors.accent[500] };
  }
  if (member.status === 'accepted') {
    return { name: 'circle-outline', color: Colors.neutral[400] };
  }
  if (member.status === 'invited') {
    return { name: 'clock-outline', color: Colors.neutral[400] };
  }
  return { name: 'close-circle-outline', color: Colors.neutral[400] };
};

const getStatusText = (member: TeamMember, t: (key: string) => string) => {
  if (member.submission?.status === 'approved') return 'Approved';
  if (member.submission?.status === 'submitted') return 'Submitted';
  if (member.status === 'accepted') return 'Ready';
  if (member.status === 'invited') return 'Pending';
  return 'Declined';
};

export default function TeamStatusSection({
  team,
  currentUserId,
}: TeamStatusSectionProps) {
  const { t } = useTranslation('friends');

  const acceptedMembers = team.members?.filter(m => m.status === 'accepted') || [];
  const completedCount = acceptedMembers.filter(
    m => m.submission?.status === 'approved'
  ).length;
  const totalCount = acceptedMembers.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('team.yourTeam')}</Text>
        <Text style={styles.progress}>
          {t('team.completedCount', { completed: completedCount, total: totalCount })}
        </Text>
      </View>

      <View style={styles.membersList}>
        {team.members?.map(member => {
          const isCurrentUser = member.userId === currentUserId;
          const icon = getStatusIcon(member);

          return (
            <View key={member.id} style={styles.memberRow}>
              <MaterialCommunityIcons
                name={icon.name as 'check-circle'}
                size={20}
                color={icon.color}
              />
              {member.user?.avatar ? (
                <Image
                  source={{ uri: member.user.avatar }}
                  style={styles.memberAvatar}
                />
              ) : (
                <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={14}
                    color={Colors.neutral[400]}
                  />
                </View>
              )}
              <Text style={styles.memberName}>
                {isCurrentUser ? 'You' : member.user?.name || 'Unknown'}
              </Text>
              <Text style={styles.memberStatus}>
                {getStatusText(member, t)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Bonus hint or earned message */}
      {allCompleted ? (
        <View style={[styles.bonusBanner, styles.bonusEarned]}>
          <MaterialCommunityIcons name="star" size={18} color="#f59e0b" />
          <Text style={styles.bonusEarnedText}>
            {t('team.bonusEarned', { xp: Math.round((team.challenge?.xp_reward || 0) * 0.2) })}
          </Text>
        </View>
      ) : team.status === 'active' ? (
        <View style={styles.bonusBanner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.primary[600]} />
          <Text style={styles.bonusHintText}>{t('team.bonusHint')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  membersList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  memberStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  bonusHintText: {
    fontSize: 13,
    color: Colors.primary[600],
    flex: 1,
  },
  bonusEarned: {
    backgroundColor: '#fef3c7',
    marginTop: 14,
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 0,
  },
  bonusEarnedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/TeamStatusSection.tsx
git commit -m "feat(mobile): add TeamStatusSection component"
```

---

## Phase 7: Integration & Testing

### Task 20: Final Integration Test

**Step 1: Run type-check**

```bash
pnpm type-check
```

Expected: No TypeScript errors

**Step 2: Run lint**

```bash
pnpm lint
```

Expected: No lint errors (or only pre-existing ones)

**Step 3: Manual testing checklist**

- [ ] Apply all migrations to Supabase
- [ ] Open Community tab, verify bell and friends icons appear
- [ ] Tap friends icon, verify FriendsScreen opens
- [ ] Search for a user, verify results appear
- [ ] Send friend request, verify it appears on other user
- [ ] Accept/decline friend request
- [ ] Verify notification appears in bell icon
- [ ] Open a team challenge, tap "Build Team"
- [ ] Select friends and send invites
- [ ] Verify team is created in database
- [ ] Accept team invite as another user
- [ ] Verify team activates when min size reached

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete friend system and team challenges implementation"
```

---

## Summary

This plan implements:

1. **Database**: 6 migrations for username, friendships, teams, team_members, notifications tables with RLS policies and triggers
2. **Shared Types**: FriendListItem, FriendRequest, FriendSuggestion, Team, TeamMember, AppNotification
3. **Stores**: friendStore, notificationStore, teamStore with Supabase integration
4. **i18n**: German and English translations for friend/team system
5. **Components**: FriendRequestCard, FriendSuggestionCard, FriendListItem, TeamStatusSection
6. **Screens**: FriendsScreen, NotificationsScreen
7. **Integration**: Community tab header icons with badge counts

Total: ~20 tasks, each with clear steps and exact code.
