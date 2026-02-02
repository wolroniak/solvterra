-- Migration: 029_create_app_notifications_table.sql
-- In-app app_notifications for friend requests, team invites, etc.

CREATE TABLE IF NOT EXISTS app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('friend_request', 'friend_accepted', 'team_invite', 'team_activated', 'team_bonus')) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_app_notifications_user ON app_notifications(user_id);
CREATE INDEX idx_app_notifications_user_unread ON app_notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_app_notifications_created ON app_notifications(created_at DESC);

ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own app_notifications" ON app_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own app_notifications" ON app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert app_notifications" ON app_notifications
  FOR INSERT WITH CHECK (true);
