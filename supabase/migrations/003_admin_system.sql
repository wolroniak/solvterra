-- Migration: SolvTerra Admin System
-- Creates a separate admin authentication system

-- ============================================
-- Step 1: Create solvterra_admins table
-- Links Supabase Auth users to admin roles
-- ============================================
CREATE TABLE IF NOT EXISTS solvterra_admins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    name text,
    created_at timestamptz DEFAULT now(),
    last_login_at timestamptz,

    -- Each user can only be an admin once
    UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_solvterra_admins_user ON solvterra_admins(user_id);

-- ============================================
-- Step 2: Enable RLS
-- ============================================
ALTER TABLE solvterra_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own record
CREATE POLICY "Admins can view own record"
ON solvterra_admins FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- Step 3: Helper function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_solvterra_admin(p_user_id uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM solvterra_admins
        WHERE user_id = COALESCE(p_user_id, auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 4: Helper function to get admin info
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_info()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    role text,
    name text,
    email text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.user_id,
        sa.role,
        sa.name,
        au.email::text
    FROM solvterra_admins sa
    JOIN auth.users au ON au.id = sa.user_id
    WHERE sa.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 5: Update admin policies for organizations
-- Admins can view and modify all organizations
-- ============================================

-- Drop existing policy if it exists and recreate with admin access
DROP POLICY IF EXISTS "Admins can view all organizations" ON organizations;
CREATE POLICY "Admins can view all organizations"
ON organizations FOR SELECT
USING (
    is_solvterra_admin()
);

DROP POLICY IF EXISTS "Admins can update all organizations" ON organizations;
CREATE POLICY "Admins can update all organizations"
ON organizations FOR UPDATE
USING (is_solvterra_admin())
WITH CHECK (is_solvterra_admin());

-- ============================================
-- Step 6: Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION is_solvterra_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_info() TO authenticated;

-- ============================================
-- Step 7: Create initial admin user
-- NOTE: Run this after creating a Supabase Auth user for admin
-- Replace the UUID with your actual admin user's auth.uid()
-- ============================================
-- INSERT INTO solvterra_admins (user_id, role, name)
-- VALUES ('<admin-auth-user-id>', 'super_admin', 'SolvTerra Admin');
