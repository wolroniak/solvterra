# Badge & XP System Design

**Date:** 2026-02-02
**Status:** Approved
**Author:** Claude Code (Brainstorming Session)

## Overview

This document describes the design for a fully functional badge and XP system in the SolvTerra mobile app. The current implementation has badge definitions and UI components but lacks the backend logic to automatically award badges.

## Goals

1. **Automatic badge awarding** - Badges are earned automatically when criteria are met
2. **Server-authoritative** - Backend controls badge logic (no client manipulation)
3. **Achievement feedback** - Users see a celebratory modal when earning badges
4. **Progress visibility** - Users can see their progress toward unearned badges

## Architecture

### Hybrid Approach (Backend + Frontend)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BADGE SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Mobile    │    │    Supabase     │    │   Edge Func     │  │
│  │    App      │◄───│    Database     │───►│   (Notify)      │  │
│  └─────────────┘    └─────────────────┘    └─────────────────┘  │
│        │                    │                      │             │
│        │                    │                      │             │
│   ┌────▼────┐         ┌────▼────┐           ┌────▼────┐        │
│   │UserStore│         │ badges  │           │ Push    │        │
│   │syncBadge│         │user_bdg │           │ Notif   │        │
│   └────┬────┘         │ triggers│           └─────────┘        │
│        │              └────┬────┘                               │
│   ┌────▼────────┐          │                                    │
│   │Achievement  │◄─────────┘                                    │
│   │Modal        │  (on insert → notify → push → app sync)      │
│   └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Backend (Supabase):**
- Badges awarded via database triggers (not manipulable)
- `check_and_award_badges()` function evaluates all badge criteria
- Runs after `recalculate_user_stats()` on submission approval
- XP bonus added atomically with badge award

**Frontend (Mobile App):**
- `syncBadges()` fetches current badges from server
- Compares with local state to detect new badges
- Shows `AchievementModal` for each new badge
- Displays progress toward unearned badges

## Database Schema

### New Table: `badges`

```sql
CREATE TABLE badges (
    id TEXT PRIMARY KEY,           -- e.g., 'first-challenge'
    name TEXT NOT NULL,            -- German name
    name_en TEXT,                  -- English name
    description TEXT NOT NULL,     -- German description
    description_en TEXT,           -- English description
    icon TEXT NOT NULL,            -- Emoji: '🌱'
    category TEXT NOT NULL,        -- 'milestone'|'category'|'special'|'streak'
    xp_bonus INTEGER DEFAULT 0,    -- XP reward when earned
    criteria_type TEXT NOT NULL,   -- See criteria types below
    criteria_value JSONB NOT NULL  -- Criteria parameters
);
```

### Criteria Types

| Type | JSONB Format | Example |
|------|--------------|---------|
| `challenge_count` | `{"count": N}` | `{"count": 5}` |
| `category_count` | `{"category": "X", "count": N}` | `{"category": "environment", "count": 5}` |
| `time_of_day` | `{"before": "HH:MM"}` or `{"after": "HH:MM"}` | `{"before": "08:00"}` |
| `streak_days` | `{"days": N}` | `{"days": 7}` |
| `rating_count` | `{"rating": N, "count": M}` | `{"rating": 5, "count": 1}` |

### Badge Data (Seed)

```sql
INSERT INTO badges (id, name, name_en, description, description_en, icon, category, xp_bonus, criteria_type, criteria_value) VALUES
-- Milestone badges
('first-challenge', 'Erste Schritte', 'First Steps', 'Schließe deinen ersten Challenge ab', 'Complete your first challenge', '🌱', 'milestone', 10, 'challenge_count', '{"count": 1}'),
('five-challenges', 'Durchstarter', 'Getting Started', 'Schließe 5 Challenges ab', 'Complete 5 challenges', '🤝', 'milestone', 25, 'challenge_count', '{"count": 5}'),
('ten-challenges', 'Auf Kurs', 'On a Roll', 'Schließe 10 Challenges ab', 'Complete 10 challenges', '💪', 'milestone', 50, 'challenge_count', '{"count": 10}'),
('twentyfive-challenges', 'Engagierter Helfer', 'Dedicated Helper', 'Schließe 25 Challenges ab', 'Complete 25 challenges', '🏆', 'milestone', 100, 'challenge_count', '{"count": 25}'),

-- Category badges
('eco-warrior', 'Öko-Krieger', 'Eco Warrior', 'Schließe 5 Umwelt-Challenges ab', 'Complete 5 environment challenges', '🌿', 'category', 30, 'category_count', '{"category": "environment", "count": 5}'),
('social-butterfly', 'Sozialheld', 'Social Butterfly', 'Schließe 5 Sozial-Challenges ab', 'Complete 5 social challenges', '❤️', 'category', 30, 'category_count', '{"category": "social", "count": 5}'),
('knowledge-seeker', 'Wissensdurst', 'Knowledge Seeker', 'Schließe 5 Bildungs-Challenges ab', 'Complete 5 education challenges', '📚', 'category', 30, 'category_count', '{"category": "education", "count": 5}'),
('health-hero', 'Gesundheitsheld', 'Health Hero', 'Schließe 5 Gesundheits-Challenges ab', 'Complete 5 health challenges', '🏥', 'category', 30, 'category_count', '{"category": "health", "count": 5}'),

-- Special badges
('early-bird', 'Frühaufsteher', 'Early Bird', 'Schließe einen Challenge vor 8 Uhr ab', 'Complete a challenge before 8 AM', '🌅', 'special', 15, 'time_of_day', '{"before": "08:00"}'),
('night-owl', 'Nachteule', 'Night Owl', 'Schließe einen Challenge nach 22 Uhr ab', 'Complete a challenge after 10 PM', '🦉', 'special', 15, 'time_of_day', '{"after": "22:00"}'),
('five-star', 'Fünf Sterne', 'Five Star', 'Erhalte eine 5-Sterne-Bewertung', 'Receive a 5-star rating from an NGO', '⭐', 'special', 20, 'rating_count', '{"rating": 5, "count": 1}'),

-- Streak badges
('week-streak', 'Wochenkrieger', 'Week Warrior', 'Halte eine 7-Tage-Streak', 'Maintain a 7-day streak', '🔥', 'streak', 50, 'streak_days', '{"days": 7}');
```

### Existing Table: `user_badges`

Already exists with correct schema:
```sql
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
);
```

## Database Functions

### `check_and_award_badges(p_user_id UUID)`

Main function that evaluates all badge criteria for a user:

```sql
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS SETOF user_badges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_badge RECORD;
    v_earned BOOLEAN;
    v_user_stats RECORD;
    v_category_counts JSONB;
    v_new_badge user_badges%ROWTYPE;
BEGIN
    -- Get user stats
    SELECT completed_challenges, xp, current_streak
    INTO v_user_stats
    FROM users WHERE id = p_user_id;

    -- Get category completion counts
    SELECT jsonb_object_agg(category, cnt) INTO v_category_counts
    FROM (
        SELECT c.category, COUNT(*) as cnt
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = p_user_id AND s.status = 'approved'
        GROUP BY c.category
    ) sub;

    -- Check each badge
    FOR v_badge IN
        SELECT * FROM badges
        WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
    LOOP
        v_earned := FALSE;

        CASE v_badge.criteria_type
            WHEN 'challenge_count' THEN
                v_earned := v_user_stats.completed_challenges >= (v_badge.criteria_value->>'count')::INT;

            WHEN 'category_count' THEN
                v_earned := COALESCE(
                    (v_category_counts->>v_badge.criteria_value->>'category')::INT, 0
                ) >= (v_badge.criteria_value->>'count')::INT;

            WHEN 'time_of_day' THEN
                -- Check if any approved submission was at the required time
                IF v_badge.criteria_value ? 'before' THEN
                    SELECT EXISTS(
                        SELECT 1 FROM submissions
                        WHERE user_id = p_user_id
                        AND status = 'approved'
                        AND EXTRACT(HOUR FROM created_at) < SPLIT_PART(v_badge.criteria_value->>'before', ':', 1)::INT
                    ) INTO v_earned;
                ELSIF v_badge.criteria_value ? 'after' THEN
                    SELECT EXISTS(
                        SELECT 1 FROM submissions
                        WHERE user_id = p_user_id
                        AND status = 'approved'
                        AND EXTRACT(HOUR FROM created_at) >= SPLIT_PART(v_badge.criteria_value->>'after', ':', 1)::INT
                    ) INTO v_earned;
                END IF;

            WHEN 'streak_days' THEN
                v_earned := COALESCE(v_user_stats.current_streak, 0) >= (v_badge.criteria_value->>'days')::INT;

            WHEN 'rating_count' THEN
                SELECT COUNT(*) >= (v_badge.criteria_value->>'count')::INT INTO v_earned
                FROM submissions
                WHERE user_id = p_user_id
                AND status = 'approved'
                AND rating = (v_badge.criteria_value->>'rating')::INT;
        END CASE;

        -- Award badge if earned
        IF v_earned THEN
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (p_user_id, v_badge.id)
            RETURNING * INTO v_new_badge;

            -- Add XP bonus
            UPDATE users SET xp = xp + v_badge.xp_bonus WHERE id = p_user_id;

            RETURN NEXT v_new_badge;
        END IF;
    END LOOP;
END;
$$;
```

### `get_badge_progress(p_user_id UUID)`

Returns progress toward all badges:

```sql
CREATE OR REPLACE FUNCTION get_badge_progress(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB := '{}';
    v_badge RECORD;
    v_current INT;
    v_required INT;
    v_user_stats RECORD;
    v_category_counts JSONB;
    v_earned_badges TEXT[];
BEGIN
    -- Get user stats
    SELECT completed_challenges, current_streak INTO v_user_stats
    FROM users WHERE id = p_user_id;

    -- Get earned badge IDs
    SELECT array_agg(badge_id) INTO v_earned_badges
    FROM user_badges WHERE user_id = p_user_id;

    -- Get category counts
    SELECT jsonb_object_agg(category, cnt) INTO v_category_counts
    FROM (
        SELECT c.category, COUNT(*) as cnt
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = p_user_id AND s.status = 'approved'
        GROUP BY c.category
    ) sub;

    -- Calculate progress for each badge
    FOR v_badge IN SELECT * FROM badges LOOP
        v_required := 1;
        v_current := 0;

        CASE v_badge.criteria_type
            WHEN 'challenge_count' THEN
                v_required := (v_badge.criteria_value->>'count')::INT;
                v_current := LEAST(v_user_stats.completed_challenges, v_required);

            WHEN 'category_count' THEN
                v_required := (v_badge.criteria_value->>'count')::INT;
                v_current := LEAST(
                    COALESCE((v_category_counts->>v_badge.criteria_value->>'category')::INT, 0),
                    v_required
                );

            WHEN 'time_of_day' THEN
                v_required := 1;
                IF v_badge.id = ANY(v_earned_badges) THEN v_current := 1; END IF;

            WHEN 'streak_days' THEN
                v_required := (v_badge.criteria_value->>'days')::INT;
                v_current := LEAST(COALESCE(v_user_stats.current_streak, 0), v_required);

            WHEN 'rating_count' THEN
                v_required := (v_badge.criteria_value->>'count')::INT;
                SELECT COUNT(*) INTO v_current FROM submissions
                WHERE user_id = p_user_id AND status = 'approved'
                AND rating = (v_badge.criteria_value->>'rating')::INT;
                v_current := LEAST(v_current, v_required);
        END CASE;

        v_result := v_result || jsonb_build_object(
            v_badge.id, jsonb_build_object(
                'current', v_current,
                'required', v_required,
                'completed', v_badge.id = ANY(COALESCE(v_earned_badges, '{}'))
            )
        );
    END LOOP;

    RETURN v_result;
END;
$$;
```

### Trigger Integration

Update `recalculate_user_stats()` to call badge check:

```sql
-- At the end of recalculate_user_stats() function:
PERFORM check_and_award_badges(NEW.user_id);
```

## Frontend Components

### AchievementModal Component

Location: `apps/mobile/components/AchievementModal.tsx`

```typescript
interface AchievementModalProps {
  badge: UserBadge | null;
  visible: boolean;
  onDismiss: () => void;
}

// Features:
// - Animated entrance (scale + fade)
// - Confetti effect (optional, via react-native-confetti-cannon)
// - Badge emoji in large circle
// - Badge name (translated)
// - XP bonus display: "+10 XP"
// - Auto-dismiss after 5 seconds or tap
// - Brand colors from theme
```

### UserStore Updates

Location: `apps/mobile/store/userStore.ts`

```typescript
interface UserState {
  // Existing...
  pendingAchievements: UserBadge[];
}

interface UserActions {
  // Existing...
  syncBadges: () => Promise<void>;
  dismissAchievement: () => void;
  getBadgeProgress: () => Promise<BadgeProgress>;
}

// syncBadges implementation:
// 1. Fetch user_badges from Supabase
// 2. Compare with local user.badges
// 3. Add new badges to pendingAchievements queue
// 4. Update user.badges with full list
```

### Badge Gallery Fix

Location: `apps/mobile/app/badges/index.tsx`

Change from:
```typescript
const isEarned = true; // DEMO
```

To:
```typescript
const earnedBadgeIds = user?.badges.map(ub => ub.badge.id) ?? [];
const isEarned = earnedBadgeIds.includes(badge.id);
```

### Progress Display

Add to badge cards for unearned badges:

```typescript
{!isEarned && progress[badge.id] && (
  <View style={styles.progressContainer}>
    <ProgressBar
      progress={progress[badge.id].current / progress[badge.id].required}
      color={theme.colors.accent}
    />
    <Text style={styles.progressText}>
      {progress[badge.id].current}/{progress[badge.id].required}
    </Text>
  </View>
)}
```

## Data Flow

### Challenge Completion Flow

1. **NGO approves submission** → `submissions.status = 'approved'`
2. **Trigger fires** → `recalculate_user_stats(user_id)`
3. **Stats updated** → `users.xp`, `users.completed_challenges`
4. **Badge check runs** → `check_and_award_badges(user_id)`
5. **New badges inserted** → `user_badges` table
6. **Notification trigger** → `notify_badge_earned()` → Edge Function → Push
7. **App receives push** or **App calls `syncBadges()`**
8. **Achievement modal** displayed for each new badge

### App Startup Flow

1. **User logs in** → `userStore.setUser()`
2. **Sync badges** → `syncBadges()` fetches from server
3. **Check for new** → Compare server vs local badges
4. **Show achievements** → Modal for any missed badges

## Implementation Steps

| # | Task | Files |
|---|------|-------|
| 1 | Create `badges` table + seed data | `supabase/migrations/021_badges_table.sql` |
| 2 | Create `check_and_award_badges()` function | `supabase/migrations/022_badge_logic.sql` |
| 3 | Create `get_badge_progress()` function | `supabase/migrations/023_badge_progress.sql` |
| 4 | Update `recalculate_user_stats()` to call badge check | `supabase/migrations/024_badge_trigger_update.sql` |
| 5 | Create `AchievementModal` component | `apps/mobile/components/AchievementModal.tsx` |
| 6 | Add `syncBadges()` and `pendingAchievements` to store | `apps/mobile/store/userStore.ts` |
| 7 | Add `AchievementProvider` for global modal handling | `apps/mobile/providers/AchievementProvider.tsx` |
| 8 | Remove demo code from badge gallery | `apps/mobile/app/badges/index.tsx` |
| 9 | Add progress display to badge cards | `apps/mobile/app/badges/index.tsx` |
| 10 | Test full flow end-to-end | Manual testing |

## Testing Checklist

- [ ] Badge awarded on first challenge completion
- [ ] Badge awarded on 5th challenge completion
- [ ] Category badge awarded after 5 category challenges
- [ ] Early bird badge awarded for submission before 8 AM
- [ ] Achievement modal displays correctly
- [ ] XP bonus added to user total
- [ ] Push notification received
- [ ] Progress bars show correct values
- [ ] Locked badges show lock icon
- [ ] Multiple badges can be earned simultaneously

## Open Questions

None at this time - design approved for implementation.
