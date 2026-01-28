-- SolvTerra Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- Table: organizations
-- ============================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  mission text,
  logo text,
  website text,
  contact_email text,
  category text check (category in ('environment', 'social', 'education', 'health', 'animals', 'culture')),
  is_verified boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- Table: challenges
-- ============================================
create table challenges (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  title_en text,
  description text not null,
  description_en text,
  instructions text,
  instructions_en text,
  category text check (category in ('environment', 'social', 'education', 'health', 'animals', 'culture')),
  type text check (type in ('digital', 'onsite')) default 'digital',
  duration_minutes int check (duration_minutes in (5, 10, 15, 30)),
  xp_reward int,
  verification_method text check (verification_method in ('photo', 'text', 'ngo_confirmation')) default 'photo',
  max_participants int,
  current_participants int default 0,
  status text check (status in ('draft', 'active', 'paused', 'completed')) default 'draft',
  image_url text,
  location_name text,
  location_address text,
  schedule_type text check (schedule_type in ('flexible', 'fixed', 'range', 'recurring')) default 'flexible',
  is_multi_person boolean default false,
  min_team_size int,
  max_team_size int,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- Table: users (students)
-- ============================================
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  avatar text,
  xp int default 0,
  level int default 1,
  created_at timestamptz default now()
);

-- ============================================
-- Table: submissions
-- ============================================
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text check (status in ('accepted', 'in_progress', 'submitted', 'approved', 'rejected')) default 'accepted',
  proof_type text check (proof_type in ('photo', 'text', 'none')),
  proof_url text,
  proof_text text,
  caption text,
  ngo_rating int check (ngo_rating between 1 and 5),
  ngo_feedback text,
  xp_earned int,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes for common queries
-- ============================================
create index idx_challenges_status on challenges(status);
create index idx_challenges_org on challenges(organization_id);
create index idx_submissions_challenge on submissions(challenge_id);
create index idx_submissions_user on submissions(user_id);
create index idx_submissions_status on submissions(status);

-- ============================================
-- Enable Realtime for relevant tables
-- ============================================
alter publication supabase_realtime add table challenges;
alter publication supabase_realtime add table submissions;

-- ============================================
-- Function: increment participant count
-- ============================================
create or replace function increment_participants(challenge_uuid uuid)
returns void as $$
begin
  update challenges
  set current_participants = current_participants + 1
  where id = challenge_uuid;
end;
$$ language plpgsql;
