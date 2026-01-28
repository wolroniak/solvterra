-- Migration: Fix registration auth issue
-- The register_organization function needs to accept user_id as parameter
-- because after signUp, the user may not be authenticated yet (email confirmation)

-- Drop the old function
DROP FUNCTION IF EXISTS register_organization(text, text, text, text, text, text, text);

-- Create updated function with p_user_id parameter
CREATE OR REPLACE FUNCTION register_organization(
    p_user_id uuid,
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
BEGIN
    -- Validate user_id
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    -- Check if user already has an organization
    IF EXISTS (SELECT 1 FROM ngo_admins WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User already has an organization';
    END IF;

    -- Create organization
    INSERT INTO organizations (name, category, contact_email, description, mission, website, logo, verification_status)
    VALUES (p_name, p_category, p_contact_email, p_description, p_mission, p_website, p_logo, 'pending')
    RETURNING id INTO v_org_id;

    -- Create ngo_admin link
    INSERT INTO ngo_admins (user_id, organization_id, role)
    VALUES (p_user_id, v_org_id, 'owner');

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_organization(uuid, text, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION register_organization(uuid, text, text, text, text, text, text, text) TO authenticated;
