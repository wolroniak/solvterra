-- Support tickets table for NGO appeals and support requests
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type text CHECK (type IN ('appeal', 'support', 'feedback', 'other')) NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    admin_response text,
    responded_by uuid REFERENCES solvterra_admins(id),
    responded_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_org_id ON support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- RLS policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Organizations can view their own tickets
CREATE POLICY "Organizations can view own tickets"
    ON support_tickets
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

-- Organizations can create tickets
CREATE POLICY "Organizations can create tickets"
    ON support_tickets
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets
    FOR SELECT
    USING (is_solvterra_admin());

-- Admins can update all tickets
CREATE POLICY "Admins can update tickets"
    ON support_tickets
    FOR UPDATE
    USING (is_solvterra_admin())
    WITH CHECK (is_solvterra_admin());

-- Function to create a support ticket
CREATE OR REPLACE FUNCTION create_support_ticket(
    p_type text,
    p_subject text,
    p_message text
)
RETURNS uuid AS $$
DECLARE
    v_org_id uuid;
    v_ticket_id uuid;
BEGIN
    -- Get the organization ID for the current user via ngo_admins
    SELECT organization_id INTO v_org_id
    FROM ngo_admins
    WHERE user_id = auth.uid();

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization not found';
    END IF;

    -- Create the ticket
    INSERT INTO support_tickets (organization_id, type, subject, message)
    VALUES (v_org_id, p_type, p_subject, p_message)
    RETURNING id INTO v_ticket_id;

    RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to respond to a ticket
CREATE OR REPLACE FUNCTION respond_to_ticket(
    p_ticket_id uuid,
    p_response text,
    p_new_status text DEFAULT 'resolved'
)
RETURNS void AS $$
DECLARE
    v_admin_id uuid;
    v_org_id uuid;
BEGIN
    -- Verify the user is an admin
    IF NOT is_solvterra_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Get admin ID
    SELECT id INTO v_admin_id
    FROM solvterra_admins
    WHERE user_id = auth.uid();

    -- Get organization ID for notification
    SELECT organization_id INTO v_org_id
    FROM support_tickets
    WHERE id = p_ticket_id;

    -- Update the ticket
    UPDATE support_tickets
    SET
        admin_response = p_response,
        status = p_new_status,
        responded_by = v_admin_id,
        responded_at = now(),
        updated_at = now()
    WHERE id = p_ticket_id;

    -- Create notification for the organization
    PERFORM create_notification(
        v_org_id,
        'Antwort auf Ihr Ticket',
        'Ihr Support-Ticket wurde beantwortet.',
        'info',
        '/support'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tickets for current organization
CREATE OR REPLACE FUNCTION get_my_tickets()
RETURNS SETOF support_tickets AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM support_tickets
    WHERE organization_id IN (
        SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
    )
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
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
