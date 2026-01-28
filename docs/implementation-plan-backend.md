# Backend Implementation Plan — Supabase Integration

> **Living document** — Updated as decisions are made during implementation.
> **Purpose**: Enable live demo sync between mobile app (student) and web dashboard (NGO).
> **Status**: Planning

---

## Demo Flow (Target)

```
NGO creates challenge (web) → Challenge appears in student feed (mobile)
Student accepts challenge (mobile) → Participant count updates (web)
Student submits proof (mobile) → NGO receives notification + sees submission (web)
NGO approves/rejects (web) → Student receives notification + XP (mobile)
```

---

## 1. Supabase Project Setup

- [ ] Create Supabase project (free tier)
- [ ] Configure environment variables for both apps
- [ ] Install `@supabase/supabase-js` in both apps
- [ ] Create shared Supabase client config in `packages/shared`

### Environment Variables

```
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Mobile: Use `expo-constants` or `.env` via `expo-env.d.ts`
Web: Use Next.js `.env.local`

---

## 2. Database Schema

### Table: `organizations`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Generated |
| name | text | Required |
| description | text | |
| mission | text | |
| logo | text | URL |
| website | text | |
| contact_email | text | |
| category | text | environment, social, education, health, animals, culture |
| is_verified | boolean | Default true for demo |
| created_at | timestamptz | Default now() |

### Table: `challenges`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Generated |
| organization_id | uuid (FK) | References organizations |
| title | text | Required |
| title_en | text | English translation |
| description | text | Required |
| description_en | text | |
| instructions | text | |
| instructions_en | text | |
| category | text | environment, social, etc. |
| type | text | 'digital' or 'onsite' |
| duration_minutes | int | 5, 10, 15, or 30 |
| xp_reward | int | Calculated from duration |
| verification_method | text | 'photo', 'text', 'ngo_confirmation' |
| max_participants | int | |
| current_participants | int | Default 0 |
| status | text | 'draft', 'active', 'paused', 'completed' |
| image_url | text | |
| location_name | text | For onsite |
| location_address | text | |
| schedule_type | text | 'flexible', 'fixed', 'range', 'recurring' |
| is_multi_person | boolean | Default false |
| min_team_size | int | |
| max_team_size | int | |
| published_at | timestamptz | |
| created_at | timestamptz | Default now() |

### Table: `users`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Generated |
| name | text | |
| email | text | |
| avatar | text | URL |
| xp | int | Default 0 |
| level | int | Default 1 |
| created_at | timestamptz | Default now() |

### Table: `submissions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Generated |
| challenge_id | uuid (FK) | References challenges |
| user_id | uuid (FK) | References users |
| status | text | 'accepted', 'in_progress', 'submitted', 'approved', 'rejected' |
| proof_type | text | 'photo', 'text', 'none' |
| proof_url | text | Photo URL |
| proof_text | text | Text submission |
| caption | text | |
| ngo_rating | int | 1-5 |
| ngo_feedback | text | |
| xp_earned | int | Set on approval |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | |
| created_at | timestamptz | Default now() |

---

## 3. Real-Time Subscriptions

### Mobile App Subscriptions

```typescript
// Listen for new active challenges
supabase
  .channel('challenges')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'challenges',
    filter: 'status=eq.active'
  }, handleChallengeChange)
  .subscribe();

// Listen for submission status updates (for current user)
supabase
  .channel('my-submissions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'submissions',
    filter: `user_id=eq.${userId}`
  }, handleSubmissionUpdate)
  .subscribe();
```

### Web Dashboard Subscriptions

```typescript
// Listen for new submissions (for org's challenges)
supabase
  .channel('org-submissions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'submissions',
  }, handleNewSubmission)
  .subscribe();

// Listen for submission status changes
supabase
  .channel('submission-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'submissions',
  }, handleSubmissionUpdate)
  .subscribe();
```

---

## 4. Integration Points (Store Modifications)

### Mobile App: `apps/mobile/store/challengeStore.ts`

| Current Function | Backend Replacement |
|-----------------|---------------------|
| `loadChallenges()` | `supabase.from('challenges').select('*, organizations(*)').eq('status', 'active')` |
| `acceptChallenge(id)` | `supabase.from('submissions').insert({...})` + increment participants |
| `submitProof(id, proof)` | `supabase.from('submissions').update({status: 'submitted', ...proof})` |

### Web Dashboard: `apps/web-dashboard/store/index.ts`

| Current Function | Backend Replacement |
|-----------------|---------------------|
| `addChallenge(challenge)` | `supabase.from('challenges').insert(challenge)` |
| `updateChallenge(id, updates)` | `supabase.from('challenges').update(updates).eq('id', id)` |
| `publishChallenge(id)` | `supabase.from('challenges').update({status: 'active', published_at: new Date()})` |
| `approveSubmission(id, rating, feedback)` | `supabase.from('submissions').update({status: 'approved', ...})` |
| `rejectSubmission(id, feedback)` | `supabase.from('submissions').update({status: 'rejected', ...})` |

---

## 5. Notification System

Visual toast notifications triggered by real-time subscription events:

### Mobile (React Native)
- Use `react-native-toast-message` or custom banner component
- Events:
  - Submission approved → "Your submission was approved! +{xp} XP"
  - Submission rejected → "Your submission needs improvement"
  - New challenge available → "New challenge from {org}: {title}"

### Web Dashboard (Next.js)
- Use `sonner` or `react-hot-toast`
- Events:
  - New submission received → "New submission from {student} for {challenge}"
  - Challenge participant joined → "{student} accepted your challenge"

---

## 6. Seed Data

Pre-populate the database with demo data matching the current mock data:
- 1 organization (Tafel Rhein-Main e.V.)
- 1 demo user (Max Mustermann, 280 XP, Helper level)
- 3-5 active challenges
- 2-3 existing submissions in various states

This allows the demo to start with a populated state while new interactions happen live.

---

## 7. File Storage (Proof Photos)

- Use Supabase Storage bucket `proof-photos`
- Mobile app uploads photo via `supabase.storage.from('proof-photos').upload()`
- Returns public URL stored in `submissions.proof_url`
- For demo: can use placeholder images or real camera uploads

---

## 8. Demo Script (Presentation Flow)

1. **Show web dashboard** — NGO logged in, existing challenges visible
2. **Create new challenge** on web dashboard → fills form, publishes
3. **Switch to mobile app** — new challenge appears in feed (real-time)
4. **Accept challenge** on mobile → participant count updates on web
5. **Submit proof** on mobile (photo or text)
6. **Switch to web dashboard** — notification appears, submission in review queue
7. **Approve submission** on web → rate with stars, add feedback
8. **Switch to mobile** — notification shows approval, XP increases

---

## 9. Implementation Order

1. Supabase project + schema creation
2. Shared Supabase client (packages/shared or each app)
3. Seed data script
4. Web dashboard store → Supabase (challenge CRUD, submissions)
5. Mobile store → Supabase (challenge loading, submission creation)
6. Real-time subscriptions (both apps)
7. Notification toasts (both apps)
8. File upload for proof photos
9. End-to-end demo test

---

## 10. Resolved Questions

- [x] **Auth**: Both — Demo mode button (instant login as preset user) + real Supabase Auth (email/password) for full flow demo
- [x] **RLS**: Skipped for demo — tables open via anon key. Acceptable for controlled presentation.
- [x] **Seed data**: SQL seed script — repeatable, version-controlled, resets database to clean demo state
- [x] **Photo uploads**: Real camera + gallery via expo-image-picker → upload to Supabase Storage bucket
- [ ] **Offline**: TBD — for now, require connectivity (demo is live anyway)

---

## Technical Decisions Log

| Date | Decision | Reasoning |
|------|----------|-----------|
| 2026-01-24 | Use Supabase over Express+Socket.io | Faster implementation, no Expo WebSocket issues, managed infrastructure, aligns with production vision |
| 2026-01-24 | Real persistence (database) | Data must survive restarts, reliable for demo day |
| 2026-01-24 | Visual notifications | Toasts for key events make the real-time sync visible to the audience |
| 2026-01-24 | Backend only (no NGO feedback UI changes yet) | Focus on core sync functionality first |
| 2026-01-24 | Both demo-mode + real Supabase Auth | Demo button for quick presentations, real auth for full flow |
| 2026-01-24 | Skip RLS for demo | Controlled environment, no need for row-level security |
| 2026-01-24 | SQL seed script | Repeatable, version-controlled, clean demo reset |
| 2026-01-24 | Real camera + gallery for proof photos | Most impressive for business angel demo, expo-image-picker already installed |
