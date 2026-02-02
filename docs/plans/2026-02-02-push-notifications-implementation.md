# Push Notifications Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a comprehensive push notification system for students and NGOs using Expo Push Notifications and Supabase Edge Functions.

**Architecture:** Database triggers detect events (submissions reviewed, new challenges, etc.) and call Supabase Edge Functions via pg_net. Edge Functions check user preferences, fetch push tokens, and send notifications through Expo's Push API.

**Tech Stack:** Supabase (PostgreSQL, Edge Functions, pg_net), Expo Notifications, TypeScript/Deno

**Worktree:** `.worktrees/push-notifications` (branch: `feature/push-notifications`)

---

## Phase 1: Database Tables

### Task 1: Create push_tokens table migration

**Files:**
- Create: `supabase/migrations/016_push_tokens.sql`

**Step 1: Create the migration file**

```sql
-- Migration: 016_push_tokens.sql
-- Push notification tokens for students and NGO admins

CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_token_owner CHECK (
        (user_id IS NOT NULL AND auth_user_id IS NULL) OR
        (user_id IS NULL AND auth_user_id IS NOT NULL)
    )
);

-- Indexes for fast lookups
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_push_tokens_auth_user ON push_tokens(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_push_tokens_user_token ON push_tokens(user_id, expo_push_token) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_push_tokens_auth_user_token ON push_tokens(auth_user_id, expo_push_token) WHERE auth_user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own tokens
CREATE POLICY "Users can view own tokens" ON push_tokens
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE id = auth.uid()) OR
        auth_user_id = auth.uid()
    );

CREATE POLICY "Users can insert own tokens" ON push_tokens
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE id = auth.uid()) OR
        auth_user_id = auth.uid()
    );

CREATE POLICY "Users can update own tokens" ON push_tokens
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE id = auth.uid()) OR
        auth_user_id = auth.uid()
    );

CREATE POLICY "Users can delete own tokens" ON push_tokens
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE id = auth.uid()) OR
        auth_user_id = auth.uid()
    );
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP tool: `apply_migration` with name `push_tokens`

**Step 3: Verify table exists**

Run via Supabase MCP tool: `list_tables` and confirm `push_tokens` appears with RLS enabled

**Step 4: Commit**

```bash
git add supabase/migrations/016_push_tokens.sql
git commit -m "feat(db): add push_tokens table for notification tokens"
```

---

### Task 2: Create notification_preferences table migration

**Files:**
- Create: `supabase/migrations/017_notification_preferences.sql`

**Step 1: Create the migration file**

```sql
-- Migration: 017_notification_preferences.sql
-- Student notification preferences

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Submission lifecycle
    submission_reviewed BOOLEAN DEFAULT true,

    -- Challenge discovery
    new_challenges BOOLEAN DEFAULT true,
    challenge_reminders BOOLEAN DEFAULT true,
    challenge_expiring BOOLEAN DEFAULT true,

    -- Gamification
    xp_milestones BOOLEAN DEFAULT true,
    badge_earned BOOLEAN DEFAULT true,
    streak_alerts BOOLEAN DEFAULT true,

    -- Community
    community_likes BOOLEAN DEFAULT false,
    community_comments BOOLEAN DEFAULT true,

    -- Meta
    weekly_digest BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP tool: `apply_migration` with name `notification_preferences`

**Step 3: Commit**

```bash
git add supabase/migrations/017_notification_preferences.sql
git commit -m "feat(db): add notification_preferences table for students"
```

---

### Task 3: Create ngo_notification_preferences table migration

**Files:**
- Create: `supabase/migrations/018_ngo_notification_preferences.sql`

**Step 1: Create the migration file**

```sql
-- Migration: 018_ngo_notification_preferences.sql
-- NGO notification preferences

CREATE TABLE ngo_notification_preferences (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,

    -- Participation
    new_participant BOOLEAN DEFAULT true,
    proof_submitted BOOLEAN DEFAULT true,

    -- Organization status
    verification_update BOOLEAN DEFAULT true,

    -- Support
    ticket_response BOOLEAN DEFAULT true,

    -- Analytics
    weekly_stats BOOLEAN DEFAULT true,
    milestone_reached BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ngo_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: NGO admins can manage their org's preferences
CREATE POLICY "NGO admins can view org preferences" ON ngo_notification_preferences
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "NGO admins can insert org preferences" ON ngo_notification_preferences
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "NGO admins can update org preferences" ON ngo_notification_preferences
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP tool: `apply_migration` with name `ngo_notification_preferences`

**Step 3: Commit**

```bash
git add supabase/migrations/018_ngo_notification_preferences.sql
git commit -m "feat(db): add ngo_notification_preferences table"
```

---

### Task 4: Create user_badges table migration

**Files:**
- Create: `supabase/migrations/019_user_badges.sql`

**Step 1: Create the migration file**

```sql
-- Migration: 019_user_badges.sql
-- Server-side badge tracking for reliable notifications

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- Index for user badge lookups
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Service role can insert badges (via Edge Functions)
CREATE POLICY "Service can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true);
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP tool: `apply_migration` with name `user_badges`

**Step 3: Commit**

```bash
git add supabase/migrations/019_user_badges.sql
git commit -m "feat(db): add user_badges table for badge tracking"
```

---

## Phase 2: Edge Functions

### Task 5: Create notify-user Edge Function

**Files:**
- Create: `supabase/functions/notify-user/index.ts`

**Step 1: Create the function file**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  type: string
  user_id: string
  payload: Record<string, unknown>
}

const NOTIFICATION_CONTENT: Record<string, (payload: Record<string, unknown>) => { title: string; body: string }> = {
  submission_reviewed: (p) => ({
    title: p.status === 'approved' ? '🎉 Challenge Approved!' : '📝 Feedback Received',
    body: p.status === 'approved'
      ? `You earned ${p.xp_earned} XP!`
      : 'Check the feedback on your submission'
  }),
  xp_milestone: (p) => ({
    title: '⬆️ Level Up!',
    body: `You reached Level ${p.new_level}!`
  }),
  badge_earned: (p) => ({
    title: '🏆 New Badge!',
    body: `You earned the ${p.badge_id} badge!`
  }),
  community_comment: (p) => ({
    title: '💬 New Comment',
    body: String(p.comment_preview || 'Someone commented on your post')
  }),
  community_like: () => ({
    title: '❤️ Someone liked your post',
    body: 'Check out your community post'
  }),
}

serve(async (req) => {
  try {
    const { type, user_id, payload }: NotifyRequest = await req.json()

    // Check user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    // Map notification type to preference key
    const prefKeyMap: Record<string, string> = {
      submission_reviewed: 'submission_reviewed',
      xp_milestone: 'xp_milestones',
      badge_earned: 'badge_earned',
      community_comment: 'community_comments',
      community_like: 'community_likes',
    }

    const prefKey = prefKeyMap[type]
    if (prefs && prefKey && prefs[prefKey] === false) {
      return new Response(JSON.stringify({ skipped: 'user_preference' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's active push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content
    const contentFn = NOTIFICATION_CONTENT[type]
    const content = contentFn ? contentFn(payload) : {
      title: 'SolvTerra',
      body: 'You have a new notification'
    }

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title: content.title,
      body: content.body,
      data: { type, ...payload },
    }))

    // Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Step 2: Deploy the function**

Run via Supabase MCP tool: `deploy_edge_function` with:
- name: `notify-user`
- entrypoint_path: `index.ts`
- verify_jwt: `false` (called from database triggers with service key)

**Step 3: Commit**

```bash
git add supabase/functions/notify-user/index.ts
git commit -m "feat(edge): add notify-user Edge Function"
```

---

### Task 6: Create notify-organization Edge Function

**Files:**
- Create: `supabase/functions/notify-organization/index.ts`

**Step 1: Create the function file**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  type: string
  organization_id: string
  payload: Record<string, unknown>
}

serve(async (req) => {
  try {
    const { type, organization_id, payload }: NotifyRequest = await req.json()

    // Check org preferences
    const { data: prefs } = await supabase
      .from('ngo_notification_preferences')
      .select('*')
      .eq('organization_id', organization_id)
      .single()

    // Map notification type to preference key
    const prefKeyMap: Record<string, string> = {
      new_participant: 'new_participant',
      proof_submitted: 'proof_submitted',
      verification_update: 'verification_update',
    }

    const prefKey = prefKeyMap[type]
    if (prefs && prefKey && prefs[prefKey] === false) {
      return new Response(JSON.stringify({ skipped: 'org_preference' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get all admin user_ids for this org
    const { data: admins } = await supabase
      .from('ngo_admins')
      .select('user_id')
      .eq('organization_id', organization_id)

    if (!admins?.length) {
      return new Response(JSON.stringify({ skipped: 'no_admins' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get push tokens for all admins
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('auth_user_id', admins.map(a => a.user_id))
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content based on type
    const contentMap: Record<string, { title: string; body: string }> = {
      new_participant: {
        title: '👋 New Participant',
        body: 'Someone accepted your challenge!'
      },
      proof_submitted: {
        title: '📸 Proof Submitted',
        body: 'A participant submitted proof for review'
      },
      verification_update: {
        title: payload.status === 'verified' ? '✅ Verified!' : '⚠️ Verification Update',
        body: payload.status === 'verified'
          ? 'Your organization is now verified!'
          : String(payload.rejection_reason) || 'Check your verification status'
      },
    }

    const content = contentMap[type] || {
      title: 'SolvTerra',
      body: 'You have a new notification'
    }

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title: content.title,
      body: content.body,
      data: { type, organization_id, ...payload },
    }))

    // Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Step 2: Deploy the function**

Run via Supabase MCP tool: `deploy_edge_function` with:
- name: `notify-organization`
- entrypoint_path: `index.ts`
- verify_jwt: `false`

**Step 3: Commit**

```bash
git add supabase/functions/notify-organization/index.ts
git commit -m "feat(edge): add notify-organization Edge Function"
```

---

### Task 7: Create notify-new-challenge Edge Function

**Files:**
- Create: `supabase/functions/notify-new-challenge/index.ts`

**Step 1: Create the function file**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  challenge_id: string
  category: string
  payload: {
    title?: string
    title_en?: string
    organization_id?: string
    xp_reward?: number
  }
}

serve(async (req) => {
  try {
    const { challenge_id, payload }: NotifyRequest = await req.json()

    // Get all users who want new challenge notifications
    const { data: users } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('new_challenges', true)

    if (!users?.length) {
      return new Response(JSON.stringify({ skipped: 'no_users_opted_in' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get push tokens for these users
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('user_id', users.map(u => u.user_id))
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content
    const title = '🌱 New Challenge Available!'
    const body = payload.title || 'Check out the latest micro-volunteering opportunity'

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title,
      body,
      data: { type: 'new_challenge', challenge_id, ...payload },
    }))

    // Expo recommends batching in chunks of 100
    const BATCH_SIZE = 100
    const results = []

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(batch),
      })
      results.push(await response.json())
    }

    return new Response(JSON.stringify({ sent: messages.length, batches: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Step 2: Deploy the function**

Run via Supabase MCP tool: `deploy_edge_function` with:
- name: `notify-new-challenge`
- entrypoint_path: `index.ts`
- verify_jwt: `false`

**Step 3: Commit**

```bash
git add supabase/functions/notify-new-challenge/index.ts
git commit -m "feat(edge): add notify-new-challenge Edge Function for broadcasts"
```

---

## Phase 3: Database Triggers

### Task 8: Create notification triggers migration

**Files:**
- Create: `supabase/migrations/020_notification_triggers.sql`

**Step 1: Create the migration file**

```sql
-- Migration: 020_notification_triggers.sql
-- Database triggers that call Edge Functions for push notifications
-- Requires pg_net extension to be enabled

-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- TRIGGER 1: Submission Reviewed (Student)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_submission_reviewed()
RETURNS TRIGGER AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status != NEW.status THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-user',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'submission_reviewed',
          'user_id', NEW.user_id::text,
          'payload', jsonb_build_object(
            'submission_id', NEW.id::text,
            'challenge_id', NEW.challenge_id::text,
            'status', NEW.status,
            'xp_earned', NEW.xp_earned,
            'feedback', NEW.ngo_feedback
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_submission_reviewed ON submissions;
CREATE TRIGGER on_submission_reviewed
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_submission_reviewed();

-- ============================================
-- TRIGGER 2: Challenge Published (Broadcast)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_new_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-new-challenge',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'challenge_id', NEW.id::text,
          'category', NEW.category,
          'payload', jsonb_build_object(
            'title', NEW.title,
            'title_en', NEW.title_en,
            'organization_id', NEW.organization_id::text,
            'xp_reward', NEW.xp_reward
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_challenge_published ON challenges;
CREATE TRIGGER on_challenge_published
  AFTER UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_challenge();

-- ============================================
-- TRIGGER 3: Level Up (Student)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.level > OLD.level THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-user',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'xp_milestone',
          'user_id', NEW.id::text,
          'payload', jsonb_build_object(
            'old_level', OLD.level,
            'new_level', NEW.level,
            'total_xp', NEW.xp
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_user_level_up ON users;
CREATE TRIGGER on_user_level_up
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_level_up();

-- ============================================
-- TRIGGER 4: Badge Earned (Student)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_badge_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/notify-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'badge_earned',
        'user_id', NEW.user_id::text,
        'payload', jsonb_build_object(
          'badge_id', NEW.badge_id,
          'earned_at', NEW.earned_at::text
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_badge_earned ON user_badges;
CREATE TRIGGER on_badge_earned
  AFTER INSERT ON user_badges
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_badge_earned();

-- ============================================
-- TRIGGER 5: New Participant (NGO)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_ngo_new_participant()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM challenges WHERE id = NEW.challenge_id;

  v_url := current_setting('app.supabase_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  IF v_url IS NOT NULL AND v_service_key IS NOT NULL AND v_org_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/notify-organization',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'new_participant',
        'organization_id', v_org_id::text,
        'payload', jsonb_build_object(
          'submission_id', NEW.id::text,
          'challenge_id', NEW.challenge_id::text,
          'user_id', NEW.user_id::text
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_new_participant ON submissions;
CREATE TRIGGER on_new_participant
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_ngo_new_participant();

-- ============================================
-- TRIGGER 6: Proof Submitted (NGO)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_ngo_proof_submitted()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    SELECT organization_id INTO v_org_id
    FROM challenges WHERE id = NEW.challenge_id;

    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL AND v_org_id IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-organization',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'proof_submitted',
          'organization_id', v_org_id::text,
          'payload', jsonb_build_object(
            'submission_id', NEW.id::text,
            'challenge_id', NEW.challenge_id::text,
            'user_id', NEW.user_id::text
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_proof_submitted ON submissions;
CREATE TRIGGER on_proof_submitted
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_ngo_proof_submitted();

-- ============================================
-- TRIGGER 7: Organization Verification (NGO)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_org_verification_push()
RETURNS TRIGGER AS $$
DECLARE
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-organization',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'verification_update',
          'organization_id', NEW.id::text,
          'payload', jsonb_build_object(
            'status', NEW.verification_status::text,
            'rejection_reason', NEW.rejection_reason
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_org_verification_push ON organizations;
CREATE TRIGGER on_org_verification_push
  AFTER UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_org_verification_push();

-- ============================================
-- TRIGGER 8: Community Comment (Student)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM community_posts WHERE id = NEW.post_id;

  -- Don't notify if commenting on own post
  IF v_post_author_id IS NOT NULL AND v_post_author_id::text != NEW.user_id::text THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-user',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'community_comment',
          'user_id', v_post_author_id::text,
          'payload', jsonb_build_object(
            'post_id', NEW.post_id::text,
            'commenter_id', NEW.user_id::text,
            'comment_preview', LEFT(NEW.content, 100)
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_community_comment ON community_comments;
CREATE TRIGGER on_community_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_post_comment();

-- ============================================
-- TRIGGER 9: Community Like (Student)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_url TEXT;
  v_service_key TEXT;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM community_posts WHERE id = NEW.post_id;

  -- Don't notify if liking own post
  IF v_post_author_id IS NOT NULL AND v_post_author_id::text != NEW.user_id::text THEN
    v_url := current_setting('app.supabase_url', true);
    v_service_key := current_setting('app.service_role_key', true);

    IF v_url IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/notify-user',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'community_like',
          'user_id', v_post_author_id::text,
          'payload', jsonb_build_object(
            'post_id', NEW.post_id::text,
            'liker_id', NEW.user_id::text
          )
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_community_like ON community_likes;
CREATE TRIGGER on_community_like
  AFTER INSERT ON community_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_post_like();
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP tool: `apply_migration` with name `notification_triggers`

**Step 3: Commit**

```bash
git add supabase/migrations/020_notification_triggers.sql
git commit -m "feat(db): add 9 notification triggers for push notifications"
```

---

## Phase 4: Mobile App Integration

### Task 9: Install Expo notification packages

**Step 1: Install packages**

```bash
cd apps/mobile
pnpm add expo-notifications expo-device
```

**Step 2: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "feat(mobile): add expo-notifications and expo-device packages"
```

---

### Task 10: Create notifications utility library

**Files:**
- Create: `apps/mobile/lib/notifications.ts`

**Step 1: Create the file**

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and store the token in Supabase
 * @param userId - The user's ID in the users table
 * @returns The Expo push token or null if registration failed
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    // Store token in Supabase
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        device_type: Platform.OS as 'ios' | 'android',
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,expo_push_token',
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error('Failed to store push token:', error);
      return null;
    }

    console.log('Push token registered:', token);
    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Unregister push token (mark as inactive)
 * @param userId - The user's ID in the users table
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;

    await supabase
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('expo_push_token', token);
  } catch (error) {
    console.error('Failed to unregister push token:', error);
  }
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all delivered notifications
 */
export async function clearNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
```

**Step 2: Commit**

```bash
git add apps/mobile/lib/notifications.ts
git commit -m "feat(mobile): add notifications utility library"
```

---

### Task 11: Create notification listener hook

**Files:**
- Create: `apps/mobile/hooks/useNotificationListener.ts`

**Step 1: Create the file**

```typescript
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { Subscription } from 'expo-notifications';

interface NotificationData {
  type?: string;
  challenge_id?: string;
  post_id?: string;
  submission_id?: string;
  [key: string]: unknown;
}

/**
 * Hook to handle notification interactions (when user taps a notification)
 * Routes to appropriate screen based on notification type
 */
export function useNotificationListener() {
  const router = useRouter();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    // Handle notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification.request.content);
      }
    );

    // Handle notification taps (when user interacts with notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;

        if (!data.type) {
          return;
        }

        switch (data.type) {
          case 'submission_reviewed':
          case 'new_challenge':
            if (data.challenge_id) {
              router.push(`/challenges/${data.challenge_id}`);
            }
            break;

          case 'xp_milestone':
          case 'badge_earned':
            router.push('/profile');
            break;

          case 'community_comment':
          case 'community_like':
            if (data.post_id) {
              router.push(`/community`);
            }
            break;

          default:
            console.log('Unknown notification type:', data.type);
        }
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}

/**
 * Hook to get the last notification that launched the app
 * Useful for handling notifications when app was closed
 */
export function useLastNotificationResponse() {
  const router = useRouter();

  useEffect(() => {
    const checkLastNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response) {
        const data = response.notification.request.content.data as NotificationData;

        if (data.type === 'submission_reviewed' && data.challenge_id) {
          router.push(`/challenges/${data.challenge_id}`);
        }
      }
    };

    checkLastNotification();
  }, [router]);
}
```

**Step 2: Commit**

```bash
git add apps/mobile/hooks/useNotificationListener.ts
git commit -m "feat(mobile): add notification listener hook for deep linking"
```

---

### Task 12: Integrate notifications into userStore

**Files:**
- Modify: `apps/mobile/store/userStore.ts`

**Step 1: Read the current file**

Read `apps/mobile/store/userStore.ts` to understand the current structure.

**Step 2: Add notification registration to login flow**

Add import at top:
```typescript
import { registerForPushNotifications, unregisterPushToken } from '@/lib/notifications';
```

Add call to `registerForPushNotifications(userId)` after successful login/signup.

Add call to `unregisterPushToken(userId)` before signing out.

**Step 3: Commit**

```bash
git add apps/mobile/store/userStore.ts
git commit -m "feat(mobile): integrate push notification registration into auth flow"
```

---

### Task 13: Add notification listener to app layout

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Read the current file**

Read `apps/mobile/app/_layout.tsx` to understand the current structure.

**Step 2: Add the notification listener hook**

Add import:
```typescript
import { useNotificationListener, useLastNotificationResponse } from '@/hooks/useNotificationListener';
```

Add hook calls inside the root layout component.

**Step 3: Commit**

```bash
git add apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): add notification listener to app layout"
```

---

### Task 14: Create notification settings screen

**Files:**
- Create: `apps/mobile/app/(tabs)/profile/notifications.tsx`

**Step 1: Create the file**

Use the code from the design document for the notification settings screen with proper i18n support.

**Step 2: Add i18n translations**

Add notification-related translations to:
- `apps/mobile/i18n/locales/de/profile.json`
- `apps/mobile/i18n/locales/en/profile.json`

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/profile/notifications.tsx
git add apps/mobile/i18n/locales/de/profile.json
git add apps/mobile/i18n/locales/en/profile.json
git commit -m "feat(mobile): add notification settings screen with i18n"
```

---

### Task 15: Add navigation to settings screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/profile/index.tsx`

**Step 1: Read the current profile screen**

Read `apps/mobile/app/(tabs)/profile/index.tsx`

**Step 2: Add navigation item for notification settings**

Add a list item or button that navigates to the notifications settings screen.

**Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/profile/index.tsx
git commit -m "feat(mobile): add navigation to notification settings"
```

---

## Phase 5: Configuration

### Task 16: Configure Supabase settings for triggers

**Step 1: Set app configuration in Supabase**

Run via Supabase SQL:
```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://qoiujdxivwnymyftnxlc.supabase.co';
ALTER DATABASE postgres SET app.service_role_key = '<service_role_key>';
```

Note: The service role key should be set securely. This step requires manual configuration in Supabase dashboard or via secure means.

**Step 2: Document the configuration**

Add a note to the design document about required Supabase configuration.

---

### Task 17: Update mobile app environment

**Files:**
- Modify: `apps/mobile/.env.example`

**Step 1: Add project ID to env example**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

**Step 2: Commit**

```bash
git add apps/mobile/.env.example
git commit -m "docs(mobile): add EXPO_PUBLIC_PROJECT_ID to env example"
```

---

## Phase 6: Final Verification

### Task 18: Run type-check and lint

**Step 1: Run type-check**

```bash
pnpm type-check
```

Expected: No TypeScript errors

**Step 2: Run lint (if configured)**

```bash
pnpm lint
```

Expected: No linting errors (or pre-existing only)

**Step 3: Commit any fixes**

If any fixes needed, commit them.

---

### Task 19: Create final commit and summary

**Step 1: Review all changes**

```bash
git log --oneline feature/push-notifications ^ron
```

**Step 2: Ensure all files are committed**

```bash
git status
```

---

## Summary

This implementation plan includes:

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-4 | Database tables (4 migrations) |
| 2 | 5-7 | Edge Functions (3 functions) |
| 3 | 8 | Database triggers (1 migration with 9 triggers) |
| 4 | 9-15 | Mobile app integration (7 tasks) |
| 5 | 16-17 | Configuration (2 tasks) |
| 6 | 18-19 | Verification (2 tasks) |

**Total: 19 tasks**

Each task is designed to be completed in 2-5 minutes with clear deliverables and commit points.
