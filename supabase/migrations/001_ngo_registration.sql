-- Migration: NGO Registration System
-- Run this in Supabase SQL Editor to add NGO registration support

-- ============================================
-- Step 1: Create verification_status enum
-- ============================================
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Step 2: Alter organizations table
-- ============================================

-- Add new columns for verification workflow
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS verified_by uuid;

-- Migrate existing data: is_verified=true -> 'verified', else 'pending'
UPDATE organizations
SET verification_status = CASE
    WHEN is_verified = true THEN 'verified'::verification_status
    ELSE 'pending'::verification_status
END
WHERE verification_status IS NULL OR verification_status = 'pending';

-- Set verified_at for already verified organizations
UPDATE organizations
SET verified_at = created_at
WHERE verification_status = 'verified' AND verified_at IS NULL;

-- Drop old is_verified column (optional - keep for backwards compatibility)
-- ALTER TABLE organizations DROP COLUMN IF EXISTS is_verified;

-- ============================================
-- Step 3: Create ngo_admins table
-- Links Supabase Auth users to organizations
-- ============================================
CREATE TABLE IF NOT EXISTS ngo_admins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role text CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'owner',
    created_at timestamptz DEFAULT now(),

    -- Each user can only be admin of one organization (for MVP)
    UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ngo_admins_user ON ngo_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_ngo_admins_org ON ngo_admins(organization_id);

-- ============================================
-- Step 4: Enable Realtime for organizations
-- (for real-time verification status updates)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE organizations;

-- ============================================
-- Step 5: Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ngo_admins
ALTER TABLE ngo_admins ENABLE ROW LEVEL SECURITY;

-- Policy: NGO admins can read their own organization
CREATE POLICY "NGO admins can view own organization"
ON organizations FOR SELECT
USING (
    id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
    OR
    -- Allow reading all verified organizations (for public listing)
    verification_status = 'verified'
);

-- Policy: NGO admins can update their own organization
CREATE POLICY "NGO admins can update own organization"
ON organizations FOR UPDATE
USING (
    id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
);

-- Policy: Anyone can insert new organization (registration)
CREATE POLICY "Anyone can create organization"
ON organizations FOR INSERT
WITH CHECK (true);

-- Policy: Users can read their own ngo_admin record
CREATE POLICY "Users can view own ngo_admin record"
ON ngo_admins FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert their own ngo_admin record
CREATE POLICY "Users can create own ngo_admin record"
ON ngo_admins FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- Step 6: Update challenges RLS
-- Only verified organizations can have active challenges
-- ============================================

-- Enable RLS on challenges if not already enabled
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active challenges from verified orgs
CREATE POLICY "Anyone can view active challenges from verified orgs"
ON challenges FOR SELECT
USING (
    status = 'active'
    AND organization_id IN (
        SELECT id FROM organizations WHERE verification_status = 'verified'
    )
);

-- Policy: NGO admins can read all their own challenges
CREATE POLICY "NGO admins can view own challenges"
ON challenges FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
);

-- Policy: NGO admins can create challenges for their organization
CREATE POLICY "NGO admins can create challenges"
ON challenges FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
);

-- Policy: NGO admins can update their own challenges
CREATE POLICY "NGO admins can update own challenges"
ON challenges FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
);

-- Policy: NGO admins can delete their own challenges
CREATE POLICY "NGO admins can delete own challenges"
ON challenges FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM ngo_admins
        WHERE user_id = auth.uid()
    )
);

-- ============================================
-- Step 7: Helper function for registration
-- Creates organization + ngo_admin in one transaction
-- ============================================
CREATE OR REPLACE FUNCTION register_organization(
    p_name text,
    p_category text,
    p_contact_email text,
    p_description text DEFAULT NULL,
    p_mission text DEFAULT NULL,
    p_website text DEFAULT NULL,
    p_logo text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
BEGIN
    -- Get current user
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if user already has an organization
    IF EXISTS (SELECT 1 FROM ngo_admins WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'User already has an organization';
    END IF;

    -- Create organization
    INSERT INTO organizations (name, category, contact_email, description, mission, website, logo, verification_status)
    VALUES (p_name, p_category, p_contact_email, p_description, p_mission, p_website, p_logo, 'pending')
    RETURNING id INTO v_org_id;

    -- Create ngo_admin link
    INSERT INTO ngo_admins (user_id, organization_id, role)
    VALUES (v_user_id, v_org_id, 'owner');

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 8: Admin functions for verification
-- (to be called by SolvTerra admins)
-- ============================================

-- Function to verify an organization
CREATE OR REPLACE FUNCTION verify_organization(p_org_id uuid, p_verified_by uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
    UPDATE organizations
    SET
        verification_status = 'verified',
        verified_at = now(),
        verified_by = COALESCE(p_verified_by, auth.uid()),
        rejection_reason = NULL
    WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject an organization
CREATE OR REPLACE FUNCTION reject_organization(p_org_id uuid, p_reason text)
RETURNS void AS $$
BEGIN
    IF p_reason IS NULL OR p_reason = '' THEN
        RAISE EXCEPTION 'Rejection reason is required';
    END IF;

    UPDATE organizations
    SET
        verification_status = 'rejected',
        rejection_reason = p_reason,
        verified_at = NULL,
        verified_by = NULL
    WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 9: Update seed data for Tafel
-- Link existing organization to a demo admin
-- ============================================

-- Note: Run this separately after creating a Supabase Auth user for the NGO admin
-- INSERT INTO ngo_admins (user_id, organization_id, role)
-- VALUES ('<supabase-auth-user-id>', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'owner');
