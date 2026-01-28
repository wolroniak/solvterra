-- Notifications table for NGO dashboard
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read boolean DEFAULT false,
    link text,
    created_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Organizations can only read their own notifications
CREATE POLICY "Organizations can view own notifications"
    ON notifications
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

-- Organizations can update their own notifications (mark as read)
CREATE POLICY "Organizations can update own notifications"
    ON notifications
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

-- Only system/admins can insert notifications
CREATE POLICY "System can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (
        is_solvterra_admin() OR
        organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
    );

-- Function to create notification for an organization
CREATE OR REPLACE FUNCTION create_notification(
    p_org_id uuid,
    p_title text,
    p_message text,
    p_type text DEFAULT 'info',
    p_link text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    v_notification_id uuid;
BEGIN
    INSERT INTO notifications (organization_id, title, message, type, link)
    VALUES (p_org_id, p_title, p_message, p_type, p_link)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE id = p_notification_id
    AND organization_id IN (
        SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for an organization
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE organization_id IN (
        SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
    )
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM notifications
        WHERE organization_id IN (
            SELECT organization_id FROM ngo_admins WHERE user_id = auth.uid()
        )
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when organization verification status changes
CREATE OR REPLACE FUNCTION notify_verification_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if verification_status changed
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_verification_status_change ON organizations;
CREATE TRIGGER on_verification_status_change
    AFTER UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION notify_verification_status_change();

-- Trigger to create notification when submission is reviewed
CREATE OR REPLACE FUNCTION notify_submission_reviewed()
RETURNS TRIGGER AS $$
DECLARE
    v_challenge_title text;
    v_org_id uuid;
BEGIN
    -- Only trigger if status changed from pending to approved/rejected
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
        -- Get challenge info
        SELECT title, organization_id INTO v_challenge_title, v_org_id
        FROM challenges
        WHERE id = NEW.challenge_id;

        IF NEW.status = 'approved' THEN
            PERFORM create_notification(
                v_org_id,
                'Einreichung genehmigt',
                'Eine Einreichung fuer "' || v_challenge_title || '" wurde genehmigt.',
                'success',
                '/submissions'
            );
        ELSE
            PERFORM create_notification(
                v_org_id,
                'Einreichung abgelehnt',
                'Eine Einreichung fuer "' || v_challenge_title || '" wurde abgelehnt.',
                'warning',
                '/submissions'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_submission_reviewed ON submissions;
CREATE TRIGGER on_submission_reviewed
    AFTER UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_submission_reviewed();
