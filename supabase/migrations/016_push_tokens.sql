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
