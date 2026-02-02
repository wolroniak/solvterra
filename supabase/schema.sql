-- ============================================
-- SolvTerra Database Schema (Consolidated)
-- ============================================
-- This file contains the complete database schema.
-- Run this in Supabase SQL Editor to create all tables from scratch.
--
-- After running this schema, run seed.sql to populate with demo data.
--
-- Last updated: 2025-01-28
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLE: organizations
-- NGOs that create challenges
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    mission TEXT,
    logo TEXT,
    website TEXT,
    contact_email TEXT,
    category TEXT CHECK (category IN ('environment', 'social', 'education', 'health', 'animals', 'culture')),
    is_verified BOOLEAN DEFAULT false,
    verification_status verification_status DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: users (students)
-- Students who complete challenges
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    avatar TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    completed_challenges INTEGER DEFAULT 0,
    hours_contributed DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: challenges
-- Micro-volunteering tasks created by NGOs
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT NOT NULL,
    description_en TEXT,
    instructions TEXT,
    instructions_en TEXT,
    category TEXT CHECK (category IN ('environment', 'social', 'education', 'health', 'animals', 'culture')),
    type TEXT CHECK (type IN ('digital', 'onsite')) DEFAULT 'digital',
    duration_minutes INTEGER CHECK (duration_minutes IN (5, 10, 15, 30)),
    xp_reward INTEGER,
    verification_method TEXT CHECK (verification_method IN ('photo', 'text', 'ngo_confirmation')) DEFAULT 'photo',
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
    image_url TEXT,
    location_name TEXT,
    location_address TEXT,
    schedule_type TEXT CHECK (schedule_type IN ('flexible', 'fixed', 'range', 'recurring')) DEFAULT 'flexible',
    is_multi_person BOOLEAN DEFAULT false,
    min_team_size INTEGER,
    max_team_size INTEGER,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: submissions
-- Student submissions for challenges
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')) DEFAULT 'in_progress',
    proof_type TEXT CHECK (proof_type IN ('photo', 'text', 'none')),
    proof_url TEXT,
    proof_text TEXT,
    caption TEXT,
    ngo_rating INTEGER CHECK (ngo_rating >= 1 AND ngo_rating <= 5),
    ngo_feedback TEXT,
    xp_earned INTEGER,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: ngo_admins
-- Links auth.users to organizations
-- ============================================
CREATE TABLE IF NOT EXISTS ngo_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'owner',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: solvterra_admins
-- Platform administrators
-- ============================================
CREATE TABLE IF NOT EXISTS solvterra_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- TABLE: notifications
-- Notifications for NGO dashboards
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: support_tickets
-- Support requests from NGOs
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('appeal', 'support', 'feedback', 'other')) NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    admin_response TEXT,
    responded_by UUID REFERENCES solvterra_admins(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: community_posts
-- Community feed posts (user stories + NGO promotions)
-- ============================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN (
        'success_story',
        'challenge_completed',
        'badge_earned',
        'level_up',
        'streak_achieved',
        'ngo_promotion'
    )),
    title TEXT,
    content TEXT,
    image_url TEXT,
    is_highlighted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Exactly one author (user OR organization)
    CONSTRAINT chk_post_author CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL)
    )
);

-- ============================================
-- TABLE: community_likes
-- Likes on community posts (FK to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (post_id, user_id)
);

-- ============================================
-- TABLE: community_comments
-- Comments on community posts (FK to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_org ON challenges(organization_id);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);

-- Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- NGO Admins
CREATE INDEX IF NOT EXISTS idx_ngo_admins_user ON ngo_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_admins_org ON ngo_admins(organization_id);

-- SolvTerra Admins
CREATE INDEX IF NOT EXISTS idx_solvterra_admins_user ON solvterra_admins(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_org_id ON support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Community Posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_org_id ON community_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_submission_id ON community_posts(submission_id);

-- Community Likes
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);

-- Community Comments
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE solvterra_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS: organizations
-- ============================================

-- Anyone can read verified organizations
CREATE POLICY "Anyone can read verified organizations"
    ON organizations FOR SELECT
    USING (verification_status = 'verified');

-- NGO admins can read their own organization
CREATE POLICY "NGO admins can view own organization"
    ON organizations FOR SELECT
    USING (
        id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    );

-- NGO admins can update their own organization
CREATE POLICY "NGO admins can update own organization"
    ON organizations FOR UPDATE
    USING (id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()))
    WITH CHECK (id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- Anyone can create an organization (registration)
CREATE POLICY "Anyone can create organization"
    ON organizations FOR INSERT
    WITH CHECK (true);

-- SolvTerra admins can view all organizations
CREATE POLICY "Admins can view all organizations"
    ON organizations FOR SELECT
    USING (is_solvterra_admin());

-- SolvTerra admins can update all organizations
CREATE POLICY "Admins can update all organizations"
    ON organizations FOR UPDATE
    USING (is_solvterra_admin())
    WITH CHECK (is_solvterra_admin());

-- ============================================
-- RLS: users
-- ============================================

-- Anyone authenticated can read user profiles
CREATE POLICY "Anyone can read user profiles"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage users"
    ON users FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM solvterra_admins WHERE user_id = auth.uid()));

-- ============================================
-- RLS: challenges
-- ============================================

-- Anyone can view active challenges from verified orgs
CREATE POLICY "Anyone can view active challenges from verified orgs"
    ON challenges FOR SELECT
    USING (
        status = 'active'
        AND organization_id IN (SELECT id FROM organizations WHERE verification_status = 'verified')
    );

-- NGO admins can view all their own challenges
CREATE POLICY "NGO admins can view own challenges"
    ON challenges FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- NGO admins can create challenges
CREATE POLICY "NGO admins can create challenges"
    ON challenges FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- NGO admins can update their own challenges
CREATE POLICY "NGO admins can update own challenges"
    ON challenges FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- NGO admins can delete their own challenges
CREATE POLICY "NGO admins can delete own challenges"
    ON challenges FOR DELETE
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- ============================================
-- RLS: submissions
-- ============================================

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- NGO admins can view submissions for their challenges
CREATE POLICY "NGO admins can view org challenge submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM challenges c
            JOIN ngo_admins na ON na.organization_id = c.organization_id
            WHERE c.id = submissions.challenge_id AND na.user_id = auth.uid()
        )
    );

-- SolvTerra admins can view all submissions
CREATE POLICY "Admins can view all submissions"
    ON submissions FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM solvterra_admins WHERE user_id = auth.uid()));

-- Users can create submissions
CREATE POLICY "Users can create own submissions"
    ON submissions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions"
    ON submissions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- NGO admins can update submissions for their challenges
CREATE POLICY "NGO admins can update org challenge submissions"
    ON submissions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM challenges c
            JOIN ngo_admins na ON na.organization_id = c.organization_id
            WHERE c.id = submissions.challenge_id AND na.user_id = auth.uid()
        )
    );

-- Users can delete their own submissions
CREATE POLICY "Users can delete own submissions"
    ON submissions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- RLS: ngo_admins
-- ============================================

-- Anyone can read ngo_admins (needed for comment author resolution)
CREATE POLICY "Allow read access to ngo_admins"
    ON ngo_admins FOR SELECT
    USING (true);

-- Users can insert their own ngo_admin record
CREATE POLICY "Users can create own ngo_admin record"
    ON ngo_admins FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- RLS: solvterra_admins
-- ============================================

-- Admins can read their own record
CREATE POLICY "Admins can view own record"
    ON solvterra_admins FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- RLS: notifications
-- ============================================

-- Organizations can view their own notifications
CREATE POLICY "Organizations can view own notifications"
    ON notifications FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- Organizations can update their own notifications
CREATE POLICY "Organizations can update own notifications"
    ON notifications FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()))
    WITH CHECK (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- System/admins can insert notifications
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        is_solvterra_admin() OR
        organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    );

-- ============================================
-- RLS: support_tickets
-- ============================================

-- Organizations can view their own tickets
CREATE POLICY "Organizations can view own tickets"
    ON support_tickets FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- Organizations can create tickets
CREATE POLICY "Organizations can create tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()));

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets FOR SELECT
    USING (is_solvterra_admin());

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
    ON support_tickets FOR UPDATE
    USING (is_solvterra_admin())
    WITH CHECK (is_solvterra_admin());

-- ============================================
-- RLS: community_posts
-- ============================================

-- Anyone authenticated can read published posts
CREATE POLICY "Anyone can read published community posts"
    ON community_posts FOR SELECT
    TO authenticated
    USING (status = 'published');

-- NGO admins can read their own org's posts (including drafts)
CREATE POLICY "NGO admins can read own org posts"
    ON community_posts FOR SELECT
    TO authenticated
    USING (
        organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    );

-- Users can read their own posts
CREATE POLICY "Users can read own posts"
    ON community_posts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users/NGO admins can create posts
CREATE POLICY "Users and NGO admins can create posts"
    ON community_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()) AND user_id IS NULL)
    );

-- Users/NGO admins can update their own posts
CREATE POLICY "Users and NGO admins can update own posts"
    ON community_posts FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    );

-- Users/NGO admins can delete their own posts
CREATE POLICY "Users and NGO admins can delete own posts"
    ON community_posts FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR
        organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    );

-- ============================================
-- RLS: community_likes
-- ============================================

-- Anyone authenticated can read likes
CREATE POLICY "Anyone can read likes"
    ON community_likes FOR SELECT
    TO authenticated
    USING (true);

-- Users can add their own likes
CREATE POLICY "Users can add own likes"
    ON community_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove own likes"
    ON community_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- RLS: community_comments
-- ============================================

-- Anyone authenticated can read comments
CREATE POLICY "Anyone can read comments"
    ON community_comments FOR SELECT
    TO authenticated
    USING (true);

-- Users can add their own comments
CREATE POLICY "Users can add own comments"
    ON community_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON community_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if current user is a SolvTerra admin
CREATE OR REPLACE FUNCTION is_solvterra_admin(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM solvterra_admins
        WHERE user_id = COALESCE(p_user_id, auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate user stats (completed challenges, hours, XP)
CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed INTEGER;
  v_hours DECIMAL(10, 2);
  v_xp INTEGER;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(c.duration_minutes) / 60.0, 0),
    COALESCE(SUM(s.xp_earned), 0)
  INTO v_completed, v_hours, v_xp
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
    AND s.status = 'approved';

  UPDATE users
  SET
    completed_challenges = v_completed,
    hours_contributed = v_hours,
    xp = v_xp
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update user stats when submission status changes
CREATE OR REPLACE FUNCTION update_user_stats_on_submission_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND (OLD.status != NEW.status)) THEN
    PERFORM recalculate_user_stats(NEW.user_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.status = 'approved') THEN
    PERFORM recalculate_user_stats(NEW.user_id);
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'approved') THEN
    PERFORM recalculate_user_stats(OLD.user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin info
CREATE OR REPLACE FUNCTION get_admin_info()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    role TEXT,
    name TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.user_id,
        sa.role,
        sa.name,
        au.email::TEXT
    FROM solvterra_admins sa
    JOIN auth.users au ON au.id = sa.user_id
    WHERE sa.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register organization (creates org + ngo_admin link)
CREATE OR REPLACE FUNCTION register_organization(
    p_user_id UUID,
    p_name TEXT,
    p_category TEXT,
    p_contact_email TEXT,
    p_description TEXT DEFAULT NULL,
    p_mission TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_logo TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    IF EXISTS (SELECT 1 FROM ngo_admins WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has an organization';
    END IF;

    INSERT INTO organizations (name, category, contact_email, description, mission, website, logo, verification_status)
    VALUES (p_name, p_category, p_contact_email, p_description, p_mission, p_website, p_logo, 'pending')
    RETURNING id INTO v_org_id;

    INSERT INTO ngo_admins (user_id, organization_id, role)
    VALUES (p_user_id, v_org_id, 'owner');

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify organization
CREATE OR REPLACE FUNCTION verify_organization(p_org_id UUID, p_verified_by UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE organizations
    SET
        verification_status = 'verified',
        is_verified = true,
        verified_at = now(),
        verified_by = COALESCE(p_verified_by, auth.uid()),
        rejection_reason = NULL
    WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject organization
CREATE OR REPLACE FUNCTION reject_organization(p_org_id UUID, p_reason TEXT)
RETURNS VOID AS $$
BEGIN
    IF p_reason IS NULL OR p_reason = '' THEN
        RAISE EXCEPTION 'Rejection reason is required';
    END IF;

    UPDATE organizations
    SET
        verification_status = 'rejected',
        is_verified = false,
        rejection_reason = p_reason,
        verified_at = NULL,
        verified_by = NULL
    WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment challenge participants
CREATE OR REPLACE FUNCTION increment_participants(challenge_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE challenges
    SET current_participants = current_participants + 1
    WHERE id = challenge_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_org_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (organization_id, title, message, type, link)
    VALUES (p_org_id, p_title, p_message, p_type, p_link)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE id = p_notification_id
    AND organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE organization_id IN (SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid())
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create support ticket
CREATE OR REPLACE FUNCTION create_support_ticket(
    p_type TEXT,
    p_subject TEXT,
    p_message TEXT
)
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_ticket_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id
    FROM ngo_admins
    WHERE user_id = auth.uid();

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization not found';
    END IF;

    INSERT INTO support_tickets (organization_id, type, subject, message)
    VALUES (v_org_id, p_type, p_subject, p_message)
    RETURNING id INTO v_ticket_id;

    RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Respond to support ticket
CREATE OR REPLACE FUNCTION respond_to_ticket(
    p_ticket_id UUID,
    p_response TEXT,
    p_new_status TEXT DEFAULT 'resolved'
)
RETURNS VOID AS $$
DECLARE
    v_admin_id UUID;
    v_org_id UUID;
BEGIN
    IF NOT is_solvterra_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT id INTO v_admin_id FROM solvterra_admins WHERE user_id = auth.uid();
    SELECT organization_id INTO v_org_id FROM support_tickets WHERE id = p_ticket_id;

    UPDATE support_tickets
    SET
        admin_response = p_response,
        status = p_new_status,
        responded_by = v_admin_id,
        responded_at = now(),
        updated_at = now()
    WHERE id = p_ticket_id;

    PERFORM create_notification(v_org_id, 'Antwort auf Ihr Ticket', 'Ihr Support-Ticket wurde beantwortet.', 'info', '/support');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get community total XP
CREATE OR REPLACE FUNCTION get_community_total_xp()
RETURNS BIGINT AS $$
    SELECT COALESCE(SUM(xp_earned), 0)::BIGINT FROM submissions WHERE status = 'approved';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get post likes count
CREATE OR REPLACE FUNCTION get_post_likes_count(post_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM community_likes WHERE post_id = post_uuid;
$$ LANGUAGE sql STABLE;

-- Get post comments count
CREATE OR REPLACE FUNCTION get_post_comments_count(post_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM community_comments WHERE post_id = post_uuid;
$$ LANGUAGE sql STABLE;

-- Check if user has liked a post
CREATE OR REPLACE FUNCTION has_user_liked_post(post_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM community_likes WHERE post_id = post_uuid AND user_id = auth.uid());
$$ LANGUAGE sql STABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update support ticket timestamp
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_support_ticket_timestamp ON support_tickets;
CREATE TRIGGER update_support_ticket_timestamp
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_timestamp();

-- Update user stats when submission status changes
DROP TRIGGER IF EXISTS trigger_update_user_stats ON submissions;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_submission_change();

-- Notify on verification status change
CREATE OR REPLACE FUNCTION notify_verification_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
        IF NEW.verification_status = 'verified' THEN
            PERFORM create_notification(
                NEW.id,
                'Verifizierung erfolgreich',
                'Ihre Organisation wurde erfolgreich verifiziert. Sie koennen jetzt Challenges erstellen.',
                'success',
                '/challenges/new'
            );
        ELSIF NEW.verification_status = 'rejected' THEN
            PERFORM create_notification(
                NEW.id,
                'Verifizierung abgelehnt',
                COALESCE('Grund: ' || NEW.rejection_reason, 'Ihre Organisation wurde abgelehnt. Bitte kontaktieren Sie den Support.'),
                'error',
                '/settings'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_verification_status_change ON organizations;
CREATE TRIGGER on_verification_status_change
    AFTER UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION notify_verification_status_change();

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION register_organization(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_organization(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_solvterra_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_info() TO authenticated;
