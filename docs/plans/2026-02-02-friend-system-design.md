# Friend Management & Team Challenge System Design

**Date:** 2026-02-02
**Status:** Approved
**Author:** Claude Code + Ron

## Overview

The mobile app shows friends that can be invited to team challenges, but there is no friend management system in the app or Supabase. This design introduces a complete friend system with bidirectional friendships, activity-based suggestions, and proper team formation for multi-person challenges.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Friend discovery | Username search + activity-based suggestions | Low friction, no sensitive permissions needed |
| Friend model | Bidirectional (request → accept) | Mutual trust needed for team invites |
| Notifications | In-app badge + activity feed | Push notifications require Firebase setup |
| Navigation | Inside Community tab header | No new nav items, uses existing space |
| Suggestion criteria | Same challenges completed | Simple, relevant, easy to implement |
| Team invite expiration | Expires with challenge deadline | No point inviting after challenge ends |
| Team formation | Auto-activate when min size reached | Keeps things moving, no manual step |
| Submissions | Each member submits individually | Individual accountability |
| Team bonus | +20% XP when all members complete | Incentivizes team coordination |
| Friend display | Basic (name, avatar, level) | Clean, performant |
| Blocking | Unfriend only (no blocking) | Simpler for MVP |

---

## Database Schema

### 1. Add Username to Users

```sql
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
CREATE INDEX idx_users_username ON users(username);
```

### 2. Friendships Table

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

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

### 3. Teams Table

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('forming', 'active', 'completed')) DEFAULT 'forming',
  created_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ
);

CREATE INDEX idx_teams_challenge ON teams(challenge_id);
CREATE INDEX idx_teams_creator ON teams(creator_id);

-- RLS Policies
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
```

### 4. Team Members Table

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('creator', 'member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('invited', 'accepted', 'declined')) DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Team creators can invite members" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE creator_id = auth.uid())
  );

CREATE POLICY "Users can update their own membership" ON team_members
  FOR UPDATE USING (auth.uid() = user_id);
```

### 5. Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('friend_request', 'friend_accepted', 'team_invite', 'team_activated', 'team_bonus')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

### 6. Add Team Reference to Submissions

```sql
ALTER TABLE submissions ADD COLUMN team_id UUID REFERENCES teams(id);
CREATE INDEX idx_submissions_team ON submissions(team_id);
```

---

## Database Functions

### Friend Suggestions (users who completed same challenges)

```sql
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
    u.avatar_url,
    u.level,
    COUNT(*)::BIGINT as shared_challenges
  FROM users u
  JOIN submissions s ON s.user_id = u.id
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
  GROUP BY u.id, u.name, u.username, u.avatar_url, u.level
  ORDER BY shared_challenges DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Get Accepted Friends

```sql
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
    u.avatar_url,
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
```

---

## Database Triggers

### Team Activation Trigger (when min size reached)

```sql
CREATE OR REPLACE FUNCTION check_team_activation()
RETURNS TRIGGER AS $$
DECLARE
  accepted_count INT;
  min_size INT;
  team_record RECORD;
BEGIN
  -- Only check on acceptance
  IF NEW.status != 'accepted' THEN RETURN NEW; END IF;

  -- Count accepted members
  SELECT COUNT(*) INTO accepted_count
  FROM team_members
  WHERE team_id = NEW.team_id AND status = 'accepted';

  -- Get min team size from challenge
  SELECT t.*, c.min_team_size INTO team_record
  FROM teams t
  JOIN challenges c ON t.challenge_id = c.id
  WHERE t.id = NEW.team_id;

  min_size := COALESCE(team_record.min_team_size, 2);

  -- Activate team if threshold reached
  IF accepted_count >= min_size AND team_record.status = 'forming' THEN
    UPDATE teams
    SET status = 'active', activated_at = now()
    WHERE id = NEW.team_id;

    -- Notify all accepted members
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_activation
  AFTER UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION check_team_activation();
```

### Team Bonus Trigger (when all members complete)

```sql
CREATE OR REPLACE FUNCTION check_team_bonus()
RETURNS TRIGGER AS $$
DECLARE
  team_record RECORD;
  accepted_members INT;
  approved_submissions INT;
  bonus_xp INT;
BEGIN
  -- Only check approved submissions with team
  IF NEW.team_id IS NULL OR NEW.status != 'approved' THEN
    RETURN NEW;
  END IF;

  -- Get team and challenge info
  SELECT t.*, c.xp_reward INTO team_record
  FROM teams t
  JOIN challenges c ON t.challenge_id = c.id
  WHERE t.id = NEW.team_id;

  -- Skip if team not active or already completed
  IF team_record.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Count members and submissions
  SELECT COUNT(*) INTO accepted_members
  FROM team_members
  WHERE team_id = NEW.team_id AND status = 'accepted';

  SELECT COUNT(*) INTO approved_submissions
  FROM submissions
  WHERE team_id = NEW.team_id AND status = 'approved';

  -- All members completed
  IF approved_submissions = accepted_members THEN
    bonus_xp := ROUND(team_record.xp_reward * 0.2);  -- 20% bonus

    -- Award bonus XP to all team members
    UPDATE users
    SET xp_total = xp_total + bonus_xp
    WHERE id IN (
      SELECT user_id FROM team_members
      WHERE team_id = NEW.team_id AND status = 'accepted'
    );

    -- Mark team as completed
    UPDATE teams SET status = 'completed' WHERE id = NEW.team_id;

    -- Notify all members about bonus
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_bonus
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_team_bonus();
```

### Friend Request Notification Trigger

```sql
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_friend_request_notification
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();
```

### Friend Accepted Notification Trigger

```sql
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_friend_accepted_notification
  AFTER UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_accepted();
```

### Team Invite Notification Trigger

```sql
CREATE OR REPLACE FUNCTION notify_team_invite()
RETURNS TRIGGER AS $$
DECLARE
  inviter_name TEXT;
  challenge_title TEXT;
  challenge_id UUID;
BEGIN
  SELECT u.name, c.title, c.id INTO inviter_name, challenge_title, challenge_id
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
    jsonb_build_object('teamId', NEW.team_id, 'challengeId', challenge_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_invite_notification
  AFTER INSERT ON team_members
  FOR EACH ROW
  WHEN (NEW.role = 'member')
  EXECUTE FUNCTION notify_team_invite();
```

---

## Mobile App UI

### Community Tab Header

```
┌─────────────────────────────────────────┐
│  Community              [🔔 •3]  [👥 •2]│
├─────────────────────────────────────────┤
│  [Posts feed as normal...]              │
```

- Bell icon → NotificationsScreen (activity feed)
- Friends icon → FriendsScreen (friend management)
- Badge counts show unread notifications / pending requests

### FriendsScreen Layout

```
┌─────────────────────────────────────────┐
│  ← Friends                    [🔍]      │
├─────────────────────────────────────────┤
│  ┌─ Pending Requests (2) ─────────────┐ │
│  │  🧑 Max Müller        [✓] [✗]      │ │
│  │  🧑 Sara Klein        [✓] [✗]      │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  ┌─ Suggestions ──────────────────────┐ │
│  │  🧑 Tim Weber (3 shared)    [+ Add]│ │
│  │  🧑 Lena Fischer (2 shared) [+ Add]│ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  ┌─ My Friends (12) ──────────────────┐ │
│  │  🧑 Anna Schneider · Helper        │ │
│  │  🧑 Jonas Hoffmann · Supporter     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Search Screen (from search icon)

```
┌─────────────────────────────────────────┐
│  ← Search Friends                       │
├─────────────────────────────────────────┤
│  [🔍 Search by username...            ] │
├─────────────────────────────────────────┤
│  🧑 tim_weber · Helper         [+ Add]  │
│  🧑 timmy123 · Starter         [+ Add]  │
└─────────────────────────────────────────┘
```

### Team Status Section (Challenge Detail)

```
┌─────────────────────────────────────────┐
│  Your Team (2/3 completed)              │
├─────────────────────────────────────────┤
│  ✓ You · Approved                       │
│  ✓ Anna · Approved                      │
│  ⏳ Jonas · Pending                      │
├─────────────────────────────────────────┤
│  Complete as a team for +20% XP bonus!  │
└─────────────────────────────────────────┘
```

### Team Invite Card (Notifications)

```
┌─────────────────────────────────────────┐
│  🌳 Beach Cleanup Challenge             │
│  Anna invited you to join their team    │
│  Team: 2/4 members · Ends in 5 days     │
│                                         │
│  [Accept]  [Decline]                    │
└─────────────────────────────────────────┘
```

---

## New Files

### Zustand Stores

**`apps/mobile/store/friendStore.ts`**
```typescript
interface FriendStore {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  suggestions: FriendSuggestion[];
  isLoading: boolean;

  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  declineRequest: (friendshipId: string) => Promise<void>;
  unfriend: (friendshipId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
}
```

**`apps/mobile/store/notificationStore.ts`**
```typescript
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribe: () => void;
}
```

### Screens

- `apps/mobile/app/(tabs)/community/friends.tsx` — Friend management
- `apps/mobile/app/(tabs)/community/notifications.tsx` — Activity feed
- `apps/mobile/app/(tabs)/community/search-friends.tsx` — Username search

### Components

- `apps/mobile/components/FriendRequestCard.tsx` — Pending request with accept/decline
- `apps/mobile/components/FriendSuggestionCard.tsx` — Suggestion with add button
- `apps/mobile/components/FriendListItem.tsx` — Friend row in list
- `apps/mobile/components/TeamInviteCard.tsx` — Team invitation notification
- `apps/mobile/components/TeamStatusSection.tsx` — Team progress display

### Modified Files

- `apps/mobile/components/InviteFriendsModal.tsx` — Fetch real friends, create team records
- `apps/mobile/app/(tabs)/community/index.tsx` — Add header icons with badges
- `apps/mobile/app/challenge/[id].tsx` — Add TeamStatusSection
- `packages/shared/src/types/index.ts` — Add Notification, Friendship, Team types

---

## Types (packages/shared)

```typescript
// Friendship types
export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  acceptedAt?: Date;
}

export interface FriendRequest {
  id: string;
  friendshipId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    level: UserLevel;
  };
  createdAt: Date;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  level: UserLevel;
  sharedChallenges: number;
}

// Team types
export interface Team {
  id: string;
  challengeId: string;
  creatorId: string;
  status: 'forming' | 'active' | 'completed';
  createdAt: Date;
  activatedAt?: Date;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  role: 'creator' | 'member';
  status: 'invited' | 'accepted' | 'declined';
  invitedAt: Date;
  acceptedAt?: Date;
  submission?: Submission;
}

// Notification types
export interface AppNotification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'team_invite' | 'team_activated' | 'team_bonus';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}
```

---

## Implementation Order

### Phase 1: Database Foundation
1. Run migration: Add username to users
2. Run migration: Create friendships table with RLS
3. Run migration: Create teams and team_members tables with RLS
4. Run migration: Create notifications table with RLS
5. Run migration: Add team_id to submissions
6. Create database functions (get_friend_suggestions, get_friends)
7. Create triggers (notifications, team activation, team bonus)

### Phase 2: Friend System
1. Create friendStore with Supabase integration
2. Create FriendsScreen with three sections (requests, suggestions, friends)
3. Create search-friends screen with username search
4. Add friend header icon to Community tab
5. Create FriendRequestCard, FriendSuggestionCard, FriendListItem components
6. Test friend request flow end-to-end

### Phase 3: Notifications
1. Create notificationStore with real-time subscription
2. Create NotificationsScreen with grouped list
3. Add notification bell icon to Community tab
4. Create TeamInviteCard component
5. Test notification delivery for all types

### Phase 4: Team Challenges
1. Update InviteFriendsModal to create real team records
2. Create TeamStatusSection component
3. Add team status to challenge detail screen
4. Update submission flow to include team_id
5. Test team formation and bonus XP flow

### Phase 5: Polish
1. Add i18n strings for all new UI
2. Add loading states and error handling
3. Test edge cases (expired challenges, declined invites, etc.)
4. Update shared types package

---

## Notification Messages (German/English)

| Type | German Title | German Body |
|------|--------------|-------------|
| friend_request | Neue Freundschaftsanfrage | {name} möchte dein Freund sein |
| friend_accepted | Anfrage akzeptiert | {name} hat deine Anfrage akzeptiert |
| team_invite | Team-Einladung | {name} lädt dich zu "{challenge}" ein |
| team_activated | Team bereit! | Dein Team für "{challenge}" ist startklar |
| team_bonus | Team-Bonus! | +{xp} XP Bonus für "{challenge}" verdient! |
