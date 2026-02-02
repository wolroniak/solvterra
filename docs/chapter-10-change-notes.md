# Chapter 10 Change Notes for Other Authors

**Purpose**: This document lists specific updates needed in other chapters to maintain consistency with the updated Chapter 10 (Prototype / Technical Details).

**Date**: January 2026
**Author**: Ron (Chapter 10)

---

## Overview of Key Changes in Chapter 10

The chapter has been updated to reflect the **actual implementation status**:

1. **Backend is production-ready** (not a mock-data prototype)
   - Supabase with PostgreSQL 15, real-time sync, authentication
   - 11 database tables, 14 database functions, 25 RLS security policies

2. **New features implemented**:
   - Platform Administration Portal (org verification, support tickets)
   - Support ticket system with admin response workflow
   - Real-time notifications
   - Full community features (likes, comments, 6 post types)

3. **Corrected numbers**:
   - Active challenge limit: **5** (not 3)
   - XP for 15 minutes: **30 XP** (not 25)
   - Badges: **12 total** (4 milestone, 4 category, 3 special, 1 streak)

---

## Chapter 2 – Product & Service

**Owner**: Nico

### Required Updates:

1. **Section 2.1 (Concept)** – Update "NGO Command Center" description:
   - Add: Organization verification workflow (pending → verified status)
   - Add: Support ticket system for NGO inquiries
   - Add: Real-time notifications for submission reviews

2. **Section 2.1 (Workflow)** – The verification flow is now:
   ```
   Photo Upload → Storage (compressed) → NGO Review Queue → Approve/Reject with Rating (1-5)
   ```
   - Add: Students receive real-time notification on review completion
   - Add: Rejected submissions can be edited and resubmitted

3. **XP Values** – If mentioned, use these verified numbers:
   | Duration | XP |
   |----------|-----|
   | 5 min | 10 XP |
   | 10 min | 20 XP |
   | 15 min | 30 XP |
   | 30 min | 50 XP |

4. **Badge System** – If referenced, there are 12 badges total:
   - Milestone (4): First Steps, Getting Started, On a Roll, Dedicated Helper
   - Category (4): Eco Warrior, Social Butterfly, Knowledge Seeker, Health Hero
   - Special (3): Early Bird, Night Owl, Five Star
   - Streak (1): Week Warrior

---

## Chapter 5 – Business Model

**Owner**: Steffi

### Required Updates:

1. **Section 5.2.3 (Key Resources)** – Technology resources are now:
   - Frontend: TypeScript monorepo (Expo SDK 54 + Next.js 14)
   - Backend: Supabase (PostgreSQL 15, Auth, Storage, Realtime)
   - NOT "web and mobile platform" in abstract terms – be specific

2. **Section 5.3.1 (Customer Relationships)** – Add for NGOs:
   - Support ticket system for appeals and inquiries
   - Organization verification workflow with status notifications
   - Real-time dashboard updates when students submit proof

3. **Section 5.4.1 (Cost Structure)** – Technical costs now include:
   - Supabase hosting (database, auth, storage, realtime)
   - Cloud storage for proof photos (currently Supabase Storage)
   - No separate "cloud hosting" cost – it's bundled in Supabase

4. **Premium NGO Features** – The technical implementation supports:
   - Advanced analytics dashboards
   - Priority visibility settings
   - Extended reporting (weekly activity charts, approval rates)

---

## Chapter 7 – Financial Plan

**Owner**: Chaimae

### Required Updates:

1. **Infrastructure Costs** – Current stack is:
   - **Supabase** (bundles: PostgreSQL, Auth, Storage, Realtime)
   - NOT separate AWS S3 / Glacier costs for MVP phase
   - AWS mentioned in Chapter 10 only for future scaling

2. **AI Verification Costs** – Chapter 10 projects:
   - €0.01–0.02 per validation call
   - This is for **future** implementation (Phase: Market Entry Q1 2027)
   - Current verification is manual NGO confirmation

3. **Storage Costs** – Current implementation:
   - Photo compression at 0.7 quality (~40% size reduction)
   - Storage in Supabase Storage bucket
   - Future: Migration to AWS S3 + Glacier only at scale

4. **Development Team** – Technology stack requires expertise in:
   - TypeScript (monorepo)
   - React Native / Expo
   - Next.js 14
   - PostgreSQL / Supabase
   - NOT generic "web and mobile development"

---

## Chapter 8 – Realisation Plan

**Owner**: Yiwen

### Required Updates:

1. **Section 8.3 (Start-up Phase)** – MVP components are now:
   - Mobile app: Expo/React Native (iOS + Android)
   - Web dashboard: Next.js 14
   - Backend: Supabase (already implemented, not "to be developed")
   - Public website: Planned for market entry phase

2. **Timeline Alignment** – Technical milestones from Chapter 10:
   | Phase | Period | Technical Focus |
   |-------|--------|-----------------|
   | Start-up | Q1–Q4 2026 | Production hardening, scaling, monitoring, Apple Sign-In |
   | Market Entry | Q1 2027 | App store launch, AI verification v1, push notifications |
   | Expansion | Q4 2027+ | Matching algorithm, advanced analytics, corporate dashboard |

3. **Backend Development** – This is NOT a future task:
   - Database schema: Implemented (11 tables)
   - Authentication: Implemented (Email + Google OAuth)
   - Storage: Implemented (proof photos bucket)
   - Real-time: Implemented (submission notifications)

4. **Future Development Streams** (for scaling, not building):
   - Infrastructure scaling (connection pooling, read replicas)
   - Enhanced auth (Apple Sign-In)
   - Monitoring (Sentry, analytics)
   - Compliance hardening (consent UI, data export)

---

## Chapter 9 – Chances & Risks

**Owner**: Jiayi

### Required Updates:

1. **Section 9.2.1 (User Engagement Risk)** – Technical mitigations implemented:
   - Real-time notifications maintain engagement
   - Gamification creates habit loops (XP, badges, levels)
   - Community feed with social proof
   - **Add**: Push notifications (planned for Market Entry phase)

2. **Section 9.2.2 (Supply-Demand Imbalance)** – Technical mitigations:
   - Dashboard analytics identify matching gaps
   - Challenge templates reduce NGO effort (4 templates implemented)
   - **Add**: Recommendation algorithm planned for Expansion phase

3. **Section 9.2.3 (Verification Cost Risk)** – Current implementation:
   - Three-tier verification: photo, text, NGO confirmation
   - Photo compression (0.7 quality) reduces storage costs
   - AI verification planned for Market Entry phase
   - **Cost projection**: €0.01–0.02 per AI validation call

4. **Section 9.2.5 (Competition Risk)** – Technical defensibility:
   - TypeScript monorepo enables rapid iteration
   - Shared codebase accelerates feature development
   - Modular architecture allows quick pivoting
   - 25 RLS policies provide security foundation

5. **New Risk to Consider**: Add reference to technical risk mitigation table in Chapter 10.5

---

## Chapter 11 – Pilot Phase Plan

**Owner**: Nico

### Required Updates:

1. **Section 11.3 (MVP Features)** – The MVP is more complete than described:
   - **Implemented**: Full backend with Supabase (not mock data)
   - **Implemented**: Real-time notifications
   - **Implemented**: Community features (likes, comments)
   - **Implemented**: Organization verification workflow
   - **Implemented**: Support ticket system

2. **NGO Interface** – Update capabilities:
   - Challenge creation with 4 templates (social media, research, cleanup, team)
   - Multi-section form with real-time preview
   - Submission queue with tab filtering (pending/approved/rejected)
   - Analytics dashboard with charts
   - Community post management

3. **Student Interface** – Update capabilities:
   - 4-tab navigation (Discover, My Challenges, Community, Profile)
   - Active challenge limit: **5** (not generic)
   - Photo compression (0.7 quality) for submissions
   - Real-time notification on review completion

4. **Verification Workflow** – Current implementation:
   - Photo uploads stored in Supabase Storage
   - NGO review with 1-5 star rating
   - Rejection requires reason (sent to student)
   - Students can edit and resubmit rejected proofs

5. **Gamification (H2)** – Exact implementation:
   - 5 levels: Starter (0-99) → Helper (100-499) → Supporter (500-1999) → Champion (2000-4999) → Legend (5000+)
   - 12 badges across 4 categories
   - XP rewards: 10/20/30/50 XP for 5/10/15/30 min
   - Team bonus: 1.5× XP

6. **Data Collection** – Available from platform:
   - Challenge acceptance/completion rates
   - XP earned per user
   - Badge acquisition rates
   - Submission approval/rejection rates
   - NGO feedback patterns
   - Community engagement (likes, comments)

---

## Cross-Reference Consistency Checklist

Before finalizing the business plan, verify these numbers match across all chapters:

| Item | Correct Value | Verify in Chapters |
|------|---------------|-------------------|
| Active challenge limit | 5 | 2, 10, 11 |
| XP for 5 min | 10 XP | 2, 5, 7, 10, 11 |
| XP for 10 min | 20 XP | 2, 5, 7, 10, 11 |
| XP for 15 min | 30 XP | 2, 5, 7, 10, 11 |
| XP for 30 min | 50 XP | 2, 5, 7, 10, 11 |
| Number of levels | 5 | 2, 10, 11 |
| Number of badges | 12 | 2, 10, 11 |
| Number of categories | 6 | 2, 3, 10 |
| Backend technology | Supabase (PostgreSQL 15) | 5, 7, 8, 10 |
| Frontend (mobile) | Expo SDK 54, React Native | 5, 8, 10 |
| Frontend (web) | Next.js 14 | 5, 8, 10 |
| AI verification phase | Market Entry (Q1 2027) | 7, 8, 10 |
| AI cost per call | €0.01–0.02 | 7, 10 |

---

## Questions for Clarification

If any chapter author has questions about technical details, please contact Ron or refer to:

1. **Platform Documentation**: `docs/SolvTerra-Platform-Documentation.md`
2. **Source Code**: `apps/mobile/` and `apps/web-dashboard/`
3. **Database Schema**: `supabase/schema.sql`
4. **Type Definitions**: `packages/shared/src/types/index.ts`

---

---

## Figure Production Checklist (For Ron)

All diagram code is available in `docs/chapter-10-diagrams.md`.

### Diagrams (Generate from Mermaid code)

| Figure | Type | Tool | File Reference |
|--------|------|------|----------------|
| 10.1 | System Architecture | [Mermaid Live](https://mermaid.live) | `chapter-10-diagrams.md` → "Figure 10.1" |
| 10.3 | Workflow Flowchart | [Mermaid Live](https://mermaid.live) | `chapter-10-diagrams.md` → "Figure 10.3" |
| 10.7 | Data Model (ERD) | [Mermaid Live](https://mermaid.live) | `chapter-10-diagrams.md` → "Figure 10.7" |
| 10.8 | Level Progression | [Mermaid Live](https://mermaid.live) | `chapter-10-diagrams.md` → "Figure 10.8" |
| 10.10 | Technical Timeline | [Mermaid Live](https://mermaid.live) | `chapter-10-diagrams.md` → "Figure 10.10" |

### Screenshots (Take from actual app)

| Figure | What to Capture | Source |
|--------|-----------------|--------|
| 10.2 | Mobile App (4 tabs in 2×2 grid) | Expo Go / iOS Simulator / Android Emulator |
| 10.4 | NGO Dashboard Overview | Web dashboard at localhost:3000 |
| 10.5 | Challenge Management | Web dashboard → Challenges page |
| 10.6 | Submission Review Queue | Web dashboard → Submissions page |

### Infographics (Create manually)

| Figure | Recommended Tool | Notes |
|--------|------------------|-------|
| 10.9 | Canva or Figma | Badge collection grid – use icons from Lucide/Feather |

### Export Settings

- **Resolution**: 300 DPI or 2× scale minimum
- **Format**: PNG for documents, SVG for web
- **Dimensions**: Full-width 1200×800px, half-width 600×400px
- **Brand colors**: Forest Green #2e6417, Teal #14b8a6, Gold #f59e0b

### Workflow

1. Open [mermaid.live](https://mermaid.live)
2. Paste code from `chapter-10-diagrams.md`
3. Adjust theme/colors if needed
4. Export as PNG (2× scale)
5. Save to `docs/figures/` folder
6. Replace placeholders in Chapter 10

---

*Document prepared by Ron (Chapter 10 author)*
*Last updated: January 2026*
