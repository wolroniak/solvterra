-- Migration: 025_add_current_streak.sql
-- Add current_streak column to users table for streak badge tracking

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
