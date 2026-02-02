# Next Steps — Post-Backend Integration

> **Status**: Supabase backend fully integrated. Real-time sync between mobile and web dashboard operational.
> **Date**: 2026-01-24

---

## Immediate: Test the Demo Flow

Run both apps and verify the full cycle works end-to-end:

```bash
pnpm dev
```

### Test Sequence

1. Open web dashboard at `localhost:3000` — verify 5 challenges load from Supabase
2. Open mobile app (Expo) — tap "Demo Login" → verify challenges appear in feed
3. **Web → Mobile**: Create a new challenge on web dashboard, publish it → verify it appears in mobile feed within seconds
4. **Mobile → Web**: Accept a challenge on mobile → verify participant count increases on web dashboard + toast notification appears
5. **Mobile → Web**: Submit proof (photo or text) → verify submission appears in web dashboard submissions tab + toast notification
6. **Web → Mobile**: Approve submission on web dashboard (with star rating + feedback) → verify mobile shows approval alert with XP earned
7. **Web → Mobile**: Reject a submission → verify mobile shows rejection alert

### Known Issues to Watch For

- If real-time updates don't appear, check Supabase dashboard → **Database → Replication** and verify `challenges` and `submissions` tables are in the `supabase_realtime` publication
- The mobile app has pre-existing TypeScript errors in `hooks/useTranslatedContent.ts` (unrelated to backend integration, does not affect runtime)
- Photo upload requires the `proof-photos` storage bucket to have public access enabled (already configured via `storage.sql`)

---

## Short-Term: NGO Pilot Feedback Implementation

Based on the NGO interviews, these UI/UX improvements should be implemented before the business angel demo:

### 1. Social Login (Google, Apple)

**Why**: NGO feedback — "registration must be easy and fast", "sign up using an existing tool such as their Google account"

**What to do**:
- Enable Google and Apple providers in Supabase Auth settings
- Add social login buttons to the mobile welcome/sign-up screen
- Use `supabase.auth.signInWithOAuth()` for the flow

### 2. Cross-Platform Clarity

**Why**: NGO feedback — "relies heavily on iOS-style interface"

**What to do**:
- Add a brief note in onboarding or about screen: "Available on iOS, Android & Web"
- Already addressed in Chapter 10 (Expo = cross-platform), but could be made visible in-app

### 3. Challenge Creation Templates

**Why**: NGO feedback — "minimal effort from our side", low-friction challenge creation

**What to do**:
- The web dashboard already has template support in the creation form
- Verify templates pre-fill correctly and publish flow is 2-3 clicks max

### 4. Gamification Context (Student App Only)

**Why**: NGO feedback — "XP appears unnecessary from NGO perspective"

**What to do**:
- Verify XP/badges are NOT shown anywhere in the web dashboard (already the case)
- Consider adding a brief tooltip in student app explaining why XP matters ("Track your impact")

---

## Medium-Term: Demo Polish

### 5. Richer Notification Content

Current notifications show generic messages. Improve by including:
- Student name and challenge title in web dashboard toasts
- Challenge name and XP amount in mobile approval alerts
- This requires passing more data through the real-time payload (read `payload.new` fields)

### 6. Loading States

Both apps now start with empty data and load from Supabase. Add:
- Skeleton loaders on web dashboard while challenges/submissions load
- Already handled in mobile (has `isLoading` spinner)

### 7. Error Handling

Add user-facing error messages when:
- Network is unavailable (Supabase unreachable)
- Challenge creation fails (validation errors)
- Photo upload fails (show retry option)

### 8. Seed Data Reset Script

For repeated demos, create a one-click reset:
- Re-run `seed.sql` to restore clean state
- Could add a "Reset Demo" button in web dashboard settings (hidden, for presenters only)

---

## Pre-Demo Checklist

Before the business angel presentation:

- [ ] Run `seed.sql` to reset database to clean state
- [ ] Verify both apps connect to Supabase (check console for errors)
- [ ] Test full demo flow (create → accept → submit → approve)
- [ ] Ensure stable internet connection (Supabase requires connectivity)
- [ ] Have both apps open side-by-side for maximum visual impact
- [ ] Prepare a backup plan: if real-time fails, use manual page refresh

---

## Architecture Decisions for Reference

| Decision | Reasoning |
|----------|-----------|
| Supabase over Express+Socket.io | No Expo WebSocket issues, managed infrastructure, faster implementation |
| No RLS (Row-Level Security) | Controlled demo environment, not production |
| SQL seed script | Repeatable, version-controlled, instant demo reset |
| Real camera + gallery | Most impressive for business angel demo |
| Demo mode + real auth | Quick button for presentations, real auth available for full flow |
| Zustand stores as data layer | Keeps UI components unchanged, only store internals replaced |
| Real-time via `postgres_changes` | Built into Supabase, no additional infrastructure needed |

---

## File Reference

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema (run first) |
| `supabase/storage.sql` | Storage bucket config (run second) |
| `supabase/seed.sql` | Demo data (run third, re-run to reset) |
| `apps/mobile/lib/supabase.ts` | Mobile Supabase client |
| `apps/mobile/lib/storage.ts` | Photo picker + upload |
| `apps/mobile/.env` | Mobile environment variables |
| `apps/web-dashboard/lib/supabase.ts` | Web Supabase client |
| `apps/web-dashboard/.env.local` | Web environment variables |
| `apps/web-dashboard/app/providers.tsx` | Data loading + real-time + notifications |
| `apps/web-dashboard/components/ui/toast-notifications.tsx` | Toast UI component |
| `docs/implementation-plan-backend.md` | Original planning document |
