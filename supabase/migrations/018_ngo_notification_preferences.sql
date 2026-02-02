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
