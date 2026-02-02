# Push Notification System Design

**Date:** 2026-02-02
**Status:** Draft
**Author:** Claude (AI-assisted design)

## Overview

Implement a comprehensive push notification system for SolvTerra using:
- **Expo Push Notifications** for cross-platform delivery (iOS/Android)
- **Supabase Edge Functions** triggered by database changes
- **New database tables** for push tokens, preferences, and badges

## Goals

1. Notify students when their submissions are reviewed
2. Notify students about new challenges matching their interests
3. Notify students about XP milestones, level ups, and badges earned
4. Notify students about community engagement (likes/comments)
5. Notify NGOs about new participants and proof submissions
6. Allow users to customize which notifications they receive

---

## Data Model

### New Table: `push_tokens`

Stores Expo push tokens for both students and NGO admins.

```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, expo_push_token),
    UNIQUE(auth_user_id, expo_push_token),
    CONSTRAINT chk_token_owner CHECK (
        (user_id IS NOT NULL AND auth_user_id IS NULL) OR
        (user_id IS NULL AND auth_user_id IS NOT NULL)
    )
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_push_tokens_auth_user ON push_tokens(auth_user_id) WHERE auth_user_id IS NOT NULL;

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens" ON push_tokens
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE id = auth.uid()) OR
        auth_user_id = auth.uid()
    );
```

### New Table: `notification_preferences` (Students)

```sql
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

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());
```

### New Table: `ngo_notification_preferences`

```sql
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

ALTER TABLE ngo_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGO admins can manage org preferences" ON ngo_notification_preferences
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );
```

### New Table: `user_badges`

Server-side badge tracking for reliable notifications.

```sql
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true);
```

---

## Edge Functions

### Function: `notify-user`

Handles notifications to students.

**Location:** `supabase/functions/notify-user/index.ts`

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

const NOTIFICATION_TITLES: Record<string, (payload: any) => { title: string; body: string }> = {
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
    body: p.comment_preview
  }),
  community_like: (p) => ({
    title: '❤️ Someone liked your post',
    body: 'Check out your community post'
  }),
}

serve(async (req) => {
  const { type, user_id, payload }: NotifyRequest = await req.json()

  // Check user preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user_id)
    .single()

  const prefKey = type.replace(/-/g, '_')
  if (prefs && prefs[prefKey] === false) {
    return new Response(JSON.stringify({ skipped: 'user_preference' }))
  }

  // Get user's push tokens
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('expo_push_token')
    .eq('user_id', user_id)
    .eq('is_active', true)

  if (!tokens?.length) {
    return new Response(JSON.stringify({ skipped: 'no_tokens' }))
  }

  // Build notification
  const content = NOTIFICATION_TITLES[type]?.(payload) || {
    title: 'SolvTerra',
    body: 'You have a new notification'
  }

  // Send to Expo
  const messages = tokens.map(t => ({
    to: t.expo_push_token,
    sound: 'default',
    title: content.title,
    body: content.body,
    data: { type, ...payload },
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  })

  return new Response(JSON.stringify(await response.json()))
})
```

### Function: `notify-organization`

Handles notifications to NGO admins.

**Location:** `supabase/functions/notify-organization/index.ts`

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
  const { type, organization_id, payload }: NotifyRequest = await req.json()

  // Check org preferences
  const { data: prefs } = await supabase
    .from('ngo_notification_preferences')
    .select('*')
    .eq('organization_id', organization_id)
    .single()

  const prefKey = type.replace(/-/g, '_')
  if (prefs && prefs[prefKey] === false) {
    return new Response(JSON.stringify({ skipped: 'org_preference' }))
  }

  // Get all admin user_ids for this org
  const { data: admins } = await supabase
    .from('ngo_admins')
    .select('user_id')
    .eq('organization_id', organization_id)

  if (!admins?.length) {
    return new Response(JSON.stringify({ skipped: 'no_admins' }))
  }

  // Get push tokens for all admins
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('expo_push_token')
    .in('auth_user_id', admins.map(a => a.user_id))
    .eq('is_active', true)

  if (!tokens?.length) {
    return new Response(JSON.stringify({ skipped: 'no_tokens' }))
  }

  // Build notification based on type
  const titles: Record<string, { title: string; body: string }> = {
    new_participant: { title: '👋 New Participant', body: 'Someone accepted your challenge!' },
    proof_submitted: { title: '📸 Proof Submitted', body: 'A participant submitted proof for review' },
    verification_update: {
      title: payload.status === 'verified' ? '✅ Verified!' : '⚠️ Verification Update',
      body: payload.status === 'verified'
        ? 'Your organization is now verified!'
        : payload.rejection_reason as string || 'Check your verification status'
    },
  }

  const content = titles[type] || { title: 'SolvTerra', body: 'You have a new notification' }

  const messages = tokens.map(t => ({
    to: t.expo_push_token,
    sound: 'default',
    title: content.title,
    body: content.body,
    data: { type, organization_id, ...payload },
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  })

  return new Response(JSON.stringify(await response.json()))
})
```

### Function: `notify-new-challenge`

Broadcasts new challenges to all students (with preference filtering).

**Location:** `supabase/functions/notify-new-challenge/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { challenge_id, category, payload } = await req.json()

  // Get all users who want new challenge notifications
  // Future: filter by category preferences
  const { data: users } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('new_challenges', true)

  if (!users?.length) {
    return new Response(JSON.stringify({ skipped: 'no_users' }))
  }

  // Get push tokens for these users
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('expo_push_token')
    .in('user_id', users.map(u => u.user_id))
    .eq('is_active', true)

  if (!tokens?.length) {
    return new Response(JSON.stringify({ skipped: 'no_tokens' }))
  }

  const messages = tokens.map(t => ({
    to: t.expo_push_token,
    sound: 'default',
    title: '🌱 New Challenge Available!',
    body: payload.title || 'Check out the latest micro-volunteering opportunity',
    data: { type: 'new_challenge', challenge_id, ...payload },
  }))

  // Expo recommends batching in chunks of 100
  const BATCH_SIZE = 100
  const results = []

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    })
    results.push(await response.json())
  }

  return new Response(JSON.stringify({ sent: messages.length, results }))
})
```

---

## Database Triggers

### 1. Submission Reviewed (Student)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_submission_reviewed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status != NEW.status THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'submission_reviewed',
        'user_id', NEW.user_id,
        'payload', jsonb_build_object(
          'submission_id', NEW.id,
          'challenge_id', NEW.challenge_id,
          'status', NEW.status,
          'xp_earned', NEW.xp_earned,
          'feedback', NEW.ngo_feedback
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_submission_reviewed
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_submission_reviewed();
```

### 2. Challenge Published (Broadcast)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_new_challenge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-new-challenge',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'challenge_id', NEW.id,
        'category', NEW.category,
        'payload', jsonb_build_object(
          'title', NEW.title,
          'title_en', NEW.title_en,
          'organization_id', NEW.organization_id,
          'xp_reward', NEW.xp_reward
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_challenge_published
  AFTER UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_challenge();
```

### 3. Level Up (Student)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level > OLD.level THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'xp_milestone',
        'user_id', NEW.id,
        'payload', jsonb_build_object(
          'old_level', OLD.level,
          'new_level', NEW.level,
          'total_xp', NEW.xp
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_user_level_up
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_level_up();
```

### 4. Badge Earned (Student)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_badge_earned()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/notify-user',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'badge_earned',
      'user_id', NEW.user_id,
      'payload', jsonb_build_object(
        'badge_id', NEW.badge_id,
        'earned_at', NEW.earned_at
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_badge_earned
  AFTER INSERT ON user_badges
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_badge_earned();
```

### 5. New Participant (NGO)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_ngo_new_participant()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM challenges WHERE id = NEW.challenge_id;

  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/notify-organization',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'new_participant',
      'organization_id', v_org_id,
      'payload', jsonb_build_object(
        'submission_id', NEW.id,
        'challenge_id', NEW.challenge_id,
        'user_id', NEW.user_id
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_new_participant
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_ngo_new_participant();
```

### 6. Proof Submitted (NGO)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_ngo_proof_submitted()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    SELECT organization_id INTO v_org_id
    FROM challenges WHERE id = NEW.challenge_id;

    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-organization',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'proof_submitted',
        'organization_id', v_org_id,
        'payload', jsonb_build_object(
          'submission_id', NEW.id,
          'challenge_id', NEW.challenge_id,
          'user_id', NEW.user_id
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_proof_submitted
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_ngo_proof_submitted();
```

### 7. Organization Verification (NGO)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_org_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status != OLD.verification_status THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-organization',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'verification_update',
        'organization_id', NEW.id,
        'payload', jsonb_build_object(
          'status', NEW.verification_status,
          'rejection_reason', NEW.rejection_reason
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_org_verification_change
  AFTER UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_org_verification();
```

### 8. Community Comment (Student)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM community_posts WHERE id = NEW.post_id;

  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'community_comment',
        'user_id', v_post_author_id,
        'payload', jsonb_build_object(
          'post_id', NEW.post_id,
          'commenter_id', NEW.user_id,
          'comment_preview', LEFT(NEW.content, 100)
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_community_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_post_comment();
```

### 9. Community Like (Student)

```sql
CREATE OR REPLACE FUNCTION trigger_notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  SELECT user_id INTO v_post_author_id
  FROM community_posts WHERE id = NEW.post_id;

  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/notify-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'community_like',
        'user_id', v_post_author_id,
        'payload', jsonb_build_object(
          'post_id', NEW.post_id,
          'liker_id', NEW.user_id
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER on_community_like
  AFTER INSERT ON community_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_post_like();
```

---

## Mobile App Integration

### Token Registration (`apps/mobile/lib/notifications.ts`)

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await supabase.from('push_tokens').upsert({
    user_id: userId,
    expo_push_token: token,
    device_type: Platform.OS,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,expo_push_token' });

  return token;
}

export async function unregisterPushToken(userId: string): Promise<void> {
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('expo_push_token', token);
}
```

### Notification Listener Hook (`apps/mobile/hooks/useNotificationListener.ts`)

```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export function useNotificationListener() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        switch (data.type) {
          case 'submission_reviewed':
            router.push(`/challenges/${data.challenge_id}`);
            break;
          case 'new_challenge':
            router.push(`/challenges/${data.challenge_id}`);
            break;
          case 'xp_milestone':
          case 'badge_earned':
            router.push('/profile');
            break;
          case 'community_comment':
          case 'community_like':
            router.push(`/community/${data.post_id}`);
            break;
        }
      }
    );

    return () => subscription.remove();
  }, [router]);
}
```

### Settings Screen (`apps/mobile/app/(tabs)/profile/notifications.tsx`)

```tsx
import { View, ScrollView, StyleSheet } from 'react-native';
import { List, Switch, Text, Divider } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

interface NotificationPrefs {
  submission_reviewed: boolean;
  new_challenges: boolean;
  challenge_reminders: boolean;
  challenge_expiring: boolean;
  xp_milestones: boolean;
  badge_earned: boolean;
  streak_alerts: boolean;
  community_likes: boolean;
  community_comments: boolean;
  weekly_digest: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  submission_reviewed: true,
  new_challenges: true,
  challenge_reminders: true,
  challenge_expiring: true,
  xp_milestones: true,
  badge_earned: true,
  streak_alerts: true,
  community_likes: false,
  community_comments: true,
  weekly_digest: true,
};

export default function NotificationSettingsScreen() {
  const userId = useUserStore((s) => s.user?.id);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setPrefs(data);
    }
    setLoading(false);
  };

  const updatePreference = async (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        [key]: value,
        updated_at: new Date().toISOString()
      });
  };

  const SettingRow = ({
    title,
    description,
    prefKey
  }: {
    title: string;
    description: string;
    prefKey: keyof NotificationPrefs;
  }) => (
    <List.Item
      title={title}
      description={description}
      right={() => (
        <Switch
          value={prefs[prefKey]}
          onValueChange={(v) => updatePreference(prefKey, v)}
        />
      )}
    />
  );

  if (loading) {
    return <View style={styles.loading} />;
  }

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Challenge Updates</List.Subheader>
        <SettingRow
          title="Submission Reviewed"
          description="When your proof is approved or needs revision"
          prefKey="submission_reviewed"
        />
        <SettingRow
          title="Challenge Reminders"
          description="Reminders for challenges you've started"
          prefKey="challenge_reminders"
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Discovery</List.Subheader>
        <SettingRow
          title="New Challenges"
          description="When new challenges match your interests"
          prefKey="new_challenges"
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Achievements</List.Subheader>
        <SettingRow
          title="Level Ups"
          description="When you reach a new level"
          prefKey="xp_milestones"
        />
        <SettingRow
          title="Badges Earned"
          description="When you unlock a new badge"
          prefKey="badge_earned"
        />
        <SettingRow
          title="Streak Alerts"
          description="When your streak is about to break"
          prefKey="streak_alerts"
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Community</List.Subheader>
        <SettingRow
          title="Comments"
          description="When someone comments on your post"
          prefKey="community_comments"
        />
        <SettingRow
          title="Likes"
          description="When someone likes your post"
          prefKey="community_likes"
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Summaries</List.Subheader>
        <SettingRow
          title="Weekly Digest"
          description="Weekly summary of your impact"
          prefKey="weekly_digest"
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create `push_tokens` table with RLS
- [ ] Create `notification_preferences` table with RLS
- [ ] Create `ngo_notification_preferences` table with RLS
- [ ] Create `user_badges` table with RLS
- [ ] Enable `pg_net` extension for HTTP calls

### Phase 2: Edge Functions
- [ ] Deploy `notify-user` function
- [ ] Deploy `notify-organization` function
- [ ] Deploy `notify-new-challenge` function
- [ ] Set up environment variables (SUPABASE_URL, SERVICE_ROLE_KEY)

### Phase 3: Database Triggers
- [ ] Create all 9 notification triggers
- [ ] Configure `app.supabase_url` and `app.service_role_key` settings
- [ ] Test each trigger individually

### Phase 4: Mobile App
- [ ] Add `expo-notifications` and `expo-device` packages
- [ ] Implement token registration in userStore
- [ ] Add notification listener hook
- [ ] Create notification settings screen
- [ ] Add i18n translations for notification titles

### Phase 5: Testing
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify preference filtering works
- [ ] Load test broadcast notifications

---

## Security Considerations

1. **Service Role Key**: Only stored in Edge Function environment, never exposed to clients
2. **RLS Policies**: All new tables have RLS enabled with appropriate policies
3. **Token Validation**: Expo validates push tokens on their end
4. **Rate Limiting**: Consider adding rate limits for broadcast notifications

---

## Future Enhancements

1. **Category-based challenge notifications**: Filter new_challenges by user's preferred categories
2. **Quiet hours**: Allow users to set do-not-disturb times
3. **Rich notifications**: Add images to notifications on supported devices
4. **Analytics**: Track notification delivery and open rates
5. **Web push**: Add browser notifications for NGO dashboard
