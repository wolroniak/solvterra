-- Migration: Remove unused 'accepted' submission status
-- The 'accepted' status was never used; submissions go directly to 'in_progress'

-- 1. Migrate any existing 'accepted' rows to 'in_progress'
UPDATE submissions SET status = 'in_progress' WHERE status = 'accepted';

-- 2. Replace CHECK constraint without 'accepted'
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected'));
