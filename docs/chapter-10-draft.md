# Chapter 10 – Prototype / Technical Details

This chapter presents the technical foundation of SolvTerra. It shows that the concept from Chapter 2 has become a working, production-ready system. The implementation addresses the requirements from market research (Chapter 3) and pilot interviews. It provides clear evidence that the platform can deliver on its promises.

---

## 10.1 Platform Architecture & User Experience

SolvTerra has three user-facing components:
1. A mobile application for student volunteers
2. A web dashboard for NGO administrators
3. A public website for awareness and onboarding (planned for market entry)

The mobile application and web dashboard are fully built. They connect to a production backend that synchronizes data in real time. Each interface serves its specific audience. All components share the same data layer and design language.

---

**[Figure 10.1: SolvTerra System Architecture]**

*Diagram requirements:*
- *Show three-layer architecture: Mobile App (iOS/Android) ↔ Supabase Backend ↔ Web Dashboard*
- *Backend box should include: PostgreSQL, Auth, Storage, Realtime*
- *Arrows indicating real-time sync between all components*
- *Use SolvTerra brand colors (Forest Green #2e6417, Teal #14b8a6)*

---

### Mobile Application (Student Interface)

The mobile application is the main entry point for student volunteers. It guides new users through a step-by-step onboarding flow:

1. A welcome screen shows the core benefits: quick micro-volunteering, XP rewards, and community support.
2. Users create an account using Google login or email registration.
3. Users select their interests from six categories: environment, social, education, health, animals, and culture.
4. Users complete an interactive tutorial.

**The main application has four navigation tabs:**

**Discover** – This tab shows micro-volunteering opportunities. The data loads in real time from the database. Students can filter by duration (5, 10, 15, or 30 minutes), challenge type (digital or on-site), and interest category. Color codes show challenge duration at a glance. Short challenges (5–10 minutes) display lightning badges to encourage quick participation. This design addresses the time barrier found in our research: 70% of students said time commitment stops them from volunteering (see Chapter 2.3).

**My Challenges** – This tab tracks active, pending, and completed challenges in separate views. Active challenges show countdown timers as deadlines approach. The app limits users to five active challenges at once. This prevents overcommitment and encourages completion. If an NGO rejects a submission, students see the feedback and can resubmit.

**Community** – This tab shows a verified social feed. Posts include challenge completions, badge awards, level-ups, streaks, NGO promotions, and success stories. Unlike regular social media, the platform verifies all content. Each post links to an approved submission. Users can like, celebrate, and comment on posts. Like counts update in real time. Users can filter posts by type: all, organizations, stories, or activity.

**Profile** – This tab shows the student's impact portfolio. It displays XP progress toward the next level with a visual bar. It also shows completed challenges, contributed hours, and earned badges. Users can view their timeline, edit their profile, and switch between German and English.

---

**[Figure 10.2: Mobile Application – Main Navigation Tabs]**

*Screenshot grid (2×2 layout) showing:*
- *Top-left: Discover tab – Challenge feed with category filters and duration badges*
- *Top-right: My Challenges tab – Active challenges with deadline indicators*
- *Bottom-left: Community tab – Social feed with achievement posts and reactions*
- *Bottom-right: Profile tab – XP progress bar, stats, and badge collection*

*Note: Use actual app screenshots from iOS or Android device. Ensure demo data shows realistic German NGO names and challenge titles.*

---

**Challenge Detail & Submission Flow:**

The challenge detail view shows:
- Task instructions
- Location and schedule details
- Contact person information
- Team composition (for multi-person challenges)
- Verification requirements

Students submit proof of completion directly through the app. Depending on the challenge type, they can:
- Upload a photo (compressed to 0.7 quality to save bandwidth)
- Write a text description
- Receive manual confirmation from the NGO

After submission, students receive a notification when the NGO reviews their proof. Approved submissions trigger a celebration screen. Rejected submissions show feedback and allow the student to try again.

---

**[Figure 10.3: Challenge Acceptance & Submission Workflow]**

*Flowchart showing the complete user journey:*

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DISCOVER   │ ──► │   ACCEPT    │ ──► │  COMPLETE   │ ──► │   SUBMIT    │
│  Challenge  │     │  Challenge  │     │    Task     │     │   Proof     │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  EARN XP    │ ◄── │  APPROVED   │ ◄── │ NGO REVIEW  │ ◄── │  SUBMITTED  │
│  + Badge    │     │             │     │  (Rating)   │     │  (Pending)  │
└─────────────┘     └─────────────┘     └──────┬──────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │  REJECTED   │ ──► │  RE-SUBMIT  │
                                        │ (Feedback)  │     │   (Edit)    │
                                        └─────────────┘     └─────────────┘
```

*Create this as a professional diagram with icons for each step. Show student actions (green) and NGO actions (blue).*

---

### Web Dashboard (NGO Command Center)

The web dashboard gives organizations a complete management interface. It has six main sections:

**Dashboard** – An overview panel shows key numbers: active challenges, total participants, pending reviews, and volunteer hours. It displays weekly activity charts and provides shortcuts to common tasks.

**Challenges** – This section manages the full challenge lifecycle. The creation workflow offers four templates for quick starts: social media post, research task, cleanup action, and team action. A detailed form covers:
- Basic information and categorization
- Duration and XP allocation (calculated automatically, see Section 10.2)
- Verification method
- Location and meeting point details
- Scheduling (flexible, fixed date, date range, or recurring)
- Contact person assignment
- Team settings with matchmaking options
- Custom tags

A live preview shows how students will see the challenge. Organizations can save drafts, publish immediately, or schedule publication.

**Submissions** – A review queue shows student proof submissions. NGOs can filter by status: pending, approved, or rejected. For each submission, NGOs can:
- View the proof image or text
- See the student profile and submission time
- Give a star rating (1–5)
- Write feedback
- Approve or reject

Rejections require a reason. This ensures students receive helpful feedback.

**Community** – Organizations manage their public posts here. They can create challenge promotions, share success stories, and post announcements. Posts can be pinned or highlighted for more visibility.

**Statistics** – An analytics dashboard shows participation trends, category distribution, approval rates, time patterns, and weekly activity through interactive charts.

**Settings** – Organizations can edit their profile, upload logos, update contact details, and set notification preferences.

---

**[Figure 10.4: NGO Web Dashboard – Main Overview]**

*Screenshot showing:*
- *Top navigation bar with organization logo and user menu*
- *KPI cards: Active Challenges, Total Participants, Pending Reviews, Volunteer Hours*
- *Weekly activity chart (bar chart showing submissions over time)*
- *Pending submissions sidebar with quick-action buttons*

*Note: Use realistic demo data showing 5+ active challenges and 100+ participants.*

---

**[Figure 10.5: NGO Dashboard – Challenge Management]**

*Screenshot showing:*
- *Challenge list view with status badges (Active, Draft, Paused)*
- *Participant progress bars (e.g., "12/50 participants")*
- *Quick actions: Edit, Pause, View Submissions*
- *"Create New Challenge" button prominently visible*

---

**[Figure 10.6: NGO Dashboard – Submission Review Queue]**

*Screenshot showing:*
- *Tab filters: Pending (8), Approved (42), Rejected (5)*
- *Submission list with student name, challenge title, submission time*
- *Detail panel showing proof photo, student caption, and rating stars*
- *Approve/Reject buttons with feedback text field*

---

### Platform Administration Portal

SolvTerra also includes an administration portal for platform operators. This portal has three functions:

**Organization Verification** – A queue shows pending organization registrations. SolvTerra administrators review each organization's details: name, description, mission, category, website, and contact email. Administrators can verify or reject each organization. Rejections require a reason. The system sends a notification to inform the organization.

**Support Ticket Management** – Organizations can submit support tickets for appeals, technical issues, or feedback. Platform administrators review tickets, respond with guidance, and track status through a workflow: open → in progress → resolved → closed.

**Platform Statistics** – Aggregate numbers across all organizations, challenges, users, and submissions give the SolvTerra team operational visibility.

### Addressing Platform and Gamification Concerns

Early pilot feedback raised two concerns. Both shaped our design decisions.

**Concern 1: iOS-only appearance**

Pilot partners thought the prototype only worked on iOS. In fact, the application uses Expo (SDK 54) and React Native. These frameworks build native apps for both iOS and Android from one codebase. The web dashboard uses Next.js 14 and runs on any modern browser. This cross-platform approach ensures everyone can use the platform. It addresses the pilot requirement that "the platform should be usable by everyone."

**Concern 2: Gamification relevance for NGOs**

Pilot partners questioned whether gamification matters to NGOs. The XP and badge system exists only in the student mobile app. It is an engagement tool grounded in behavioral research. Our market analysis shows that 54% of students find rewards motivating (see Chapter 2.3). Gamification turns small contributions into a visible impact portfolio. This sustains long-term participation. The NGO dashboard, by contrast, is a business tool. It shows only operational data relevant to organizational decisions. It has no gamification elements.

---

## 10.2 Technical Implementation (Development Milestone 1)

### Technology Stack

The platform uses a TypeScript monorepo managed with pnpm workspaces. TypeScript enforces strict type safety across all packages. This approach enables code sharing between applications. The architecture has three frontend packages and one production backend:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Mobile App | Expo SDK 54, React Native 0.79, React 19, React Native Paper, Zustand 5, i18next | Cross-platform student application |
| Web Dashboard | Next.js 14 (App Router), React 19, shadcn/ui (Radix), Tailwind CSS, Recharts, Zustand 4 | NGO management interface and admin portal |
| Shared Package | TypeScript (types, constants, utilities) | Unified data models, business logic, and validation rules |
| Backend | Supabase (PostgreSQL 15, Auth, Storage, Realtime) | Database, authentication, file storage, real-time sync |

This architecture provides type-safe data contracts between all applications. Both frontends use the same type definitions and constants. This ensures consistency while allowing independent deployment.

### Backend Infrastructure

The backend runs on Supabase, a managed platform that combines PostgreSQL database, authentication, file storage, and real-time updates. This choice allows rapid development while supporting production-scale operations.

**Key capabilities:**

| Capability | What It Does | Business Value |
|------------|--------------|----------------|
| **11 database tables** | Store all platform data with relationships | Complete data model for two-sided marketplace |
| **14 business logic functions** | Handle registrations, verifications, statistics | Automated workflows reduce manual operations |
| **25 security policies** | Control data access at database level | GDPR compliance by design |
| **Real-time sync** | Instant updates across all devices | Users see changes immediately |
| **Cloud storage** | Store proof photos securely | Scalable media handling |

---

**[Figure 10.7: Simplified Data Model]**

*Diagram showing core entity relationships:*

```
┌──────────────────┐         ┌──────────────────┐
│   ORGANIZATION   │ ──1:N── │    CHALLENGE     │
│                  │         │                  │
│ • name           │         │ • title          │
│ • verification   │         │ • category       │
│ • category       │         │ • duration       │
└────────┬─────────┘         │ • xp_reward      │
         │                   └────────┬─────────┘
         │                            │
      1:N│                         1:N│
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│    NGO_ADMIN     │         │   SUBMISSION     │
│                  │         │                  │
│ • email          │         │ • status         │
│ • role           │         │ • proof_url      │
└──────────────────┘         │ • xp_earned      │
                             └────────┬─────────┘
                                      │
                                   N:1│
                                      │
                                      ▼
                             ┌──────────────────┐
                             │      USER        │
                             │                  │
                             │ • xp_total       │
                             │ • level          │
                             │ • badges         │
                             └────────┬─────────┘
                                      │
                                   1:N│
                                      ▼
                             ┌──────────────────┐
                             │ COMMUNITY_POST   │
                             │                  │
                             │ • type           │
                             │ • likes_count    │
                             └──────────────────┘
```

*Create this as a professional ERD with color-coded entities: Organizations (blue), Users (green), Content (orange).*

---

### Authentication & Security

The platform supports multiple login methods to maximize conversion:

- **Students**: Google login or email registration (addresses pilot feedback: "registration must be easy and fast")
- **NGOs**: Four-step registration wizard with organization verification
- **Administrators**: Separate secure access for platform operations

All data access is controlled through Row Level Security. Students see only their own submissions. NGOs see only their organization's data. This architecture ensures GDPR compliance by design.

### Internationalization

The platform supports German and English from day one:
- Application interface translations (buttons, navigation, messages)
- Content translations for challenges and posts (stored as `title_en`, `description_en`)
- Automatic language detection with manual override

### Verification System

The verification system supports three proof methods. NGOs choose the method when creating each challenge:

1. **Photo Upload** – For on-site activities. Students capture or select an image. The app compresses it to 0.7 quality and uploads it to Supabase Storage. The system stores the public URL with the submission record.

2. **Text Submission** – For digital tasks. Students write a description of their completed work.

3. **NGO Confirmation** – For complex assignments. The NGO marks the submission as complete after direct confirmation.

This tiered approach balances automation with human oversight. It addresses the verification integrity requirements from Chapter 9.2.3.

### Core Feature Implementation

The current system implements the complete workflow from Chapter 2:

1. **Challenge Lifecycle** – Creation with templates, multi-section forms, publication, pause/resume, draft saving, and status changes (draft → active → completed → archived)

2. **Submission Workflow** – Accept → In Progress → Submitted → Approved/Rejected. Includes proof upload to cloud storage, star ratings, written feedback, and XP distribution on approval.

3. **Gamification Engine** – XP rewards based on challenge duration:

| Duration | Base XP | Team Bonus (1.5×) |
|----------|---------|-------------------|
| 5 minutes | 10 XP | 15 XP |
| 10 minutes | 20 XP | 30 XP |
| 15 minutes | 30 XP | 45 XP |
| 30 minutes | 50 XP | 75 XP |

Five progression levels based on total XP:

| Level | Name | XP Threshold | Description |
|-------|------|--------------|-------------|
| 1 | Starter | 0–99 | New to the platform |
| 2 | Helper | 100–499 | Getting started with volunteering |
| 3 | Supporter | 500–1,999 | Regular contributor |
| 4 | Champion | 2,000–4,999 | Dedicated volunteer |
| 5 | Legend | 5,000+ | Top community contributor |

Twelve achievement badges in four categories:
- **Milestone** (4): First Steps, Getting Started, On a Roll, Dedicated Helper
- **Category** (4): Eco Warrior, Social Butterfly, Knowledge Seeker, Health Hero
- **Special** (3): Early Bird, Night Owl, Five Star
- **Streak** (1): Week Warrior

---

**[Figure 10.8: Level Progression System]**

*Infographic showing the five levels as a horizontal progression:*

```
STARTER ────► HELPER ────► SUPPORTER ────► CHAMPION ────► LEGEND
 0 XP         100 XP        500 XP         2,000 XP       5,000 XP
  🌱            🤝            💪              🏆             ⭐
```

*Design notes:*
- *Use icons or illustrations for each level*
- *Show XP thresholds clearly below each level*
- *Use gradient color progression (light green → dark green → gold)*
- *Consider showing example user at "Helper" level with progress bar to "Supporter"*

---

**[Figure 10.9: Achievement Badge Collection]**

*Grid layout showing all 12 badges organized by category:*

| **Milestone Badges** | **Category Badges** | **Special Badges** | **Streak** |
|:-------------------:|:------------------:|:-----------------:|:----------:|
| 🚀 First Steps | 🌿 Eco Warrior | 🌅 Early Bird | 🔥 Week Warrior |
| 📈 Getting Started | 💕 Social Butterfly | 🌙 Night Owl | |
| ⚡ On a Roll | 📚 Knowledge Seeker | ⭐ Five Star | |
| 🏅 Dedicated Helper | ❤️ Health Hero | | |

*Design notes:*
- *Each badge should have a distinct icon and name*
- *Show earned vs locked state (grayscale for locked)*
- *Include the XP bonus for each badge (e.g., "+10 XP", "+30 XP")*

---

4. **Multi-Person Challenges** – Team formation with configurable minimum and maximum sizes. Solo users can join teams through matchmaking. Teams have coordination features.

5. **Community Platform** – Six post types: success story, challenge completed, badge earned, level up, streak achieved, and NGO promotion. Users can like and unlike posts with real-time counts. Threaded commenting allows discussions. Posts can be pinned or highlighted. Author verification links posts to approved submissions.

6. **Bilingual Support** – Full German and English coverage. The system detects device language, allows manual override, and remembers the preference.

7. **Organization Verification** – A queue-based review process with verify and reject actions. Rejections require a reason. The system sends automatic notifications.

8. **Support System** – Ticket creation for appeals, support, feedback, or other topics. Status tracking shows progress. Administrators respond through a workflow. Users receive notifications when tickets are resolved.

### Incorporating Pilot Feedback

Based on NGO pilot interviews, we made these changes:

- **Simplified onboarding**: Google login removes the need for a new account. This addresses the feedback that "registration must be easy and fast."

- **Platform clarity**: The mobile app supports both iOS and Android through Expo. Web export provides a fallback option.

- **Low-friction challenge creation**: Templates reduce the effort to post a first challenge. The four templates (social media, research, cleanup, team action) address the requirement for "minimal effort from our side."

- **Verification workflow**: NGOs can review and rate submissions efficiently. The queue interface has tab filtering and batch processing.

- **Functional MVP as proof of concept**: The working platform with a real backend satisfies the pilot partner prerequisite: "a clearly defined concept, a working MVP, and proof of volunteer interest."

---

## 10.3 Launch of Web-Platform / App

### Mobile Application Distribution

The mobile application uses Expo Application Services (EAS) for builds and submissions. The deployment strategy has three stages:

**Beta Testing** – We distribute test builds through TestFlight (iOS) and internal testing tracks (Google Play). Pilot NGO partners and initial students test the app. This allows controlled validation before public release.

**Production Release** – After successful pilot testing, we publish on the App Store and Google Play Store at the same time. One codebase produces optimized native builds for both platforms.

**Continuous Delivery** – Expo Updates allows over-the-air (OTA) updates. We can push changes without waiting for App Store review. This allows same-day bug fixes and feature improvements for non-native code changes.

### Web Dashboard Deployment

We deploy the Next.js dashboard through Vercel cloud hosting. The setup includes a custom domain, SSL encryption (secure connection), and CDN distribution (content delivery network for global speed). The rollout follows a staged access model:

1. Pilot NGOs receive early access during the start-up phase
2. Broader availability comes with market entry
3. Each organization goes through verification to maintain platform trust

### From Current System to Production Scale

The current system works with a production backend. Scaling to full operations requires four development tracks:

1. **Infrastructure Scaling** – The current Supabase instance supports the pilot phase. Production scaling will add database connection pooling (managing multiple database connections efficiently), read replicas for analytics, and CDN optimization for media delivery.

2. **Enhanced Authentication** – We will add Apple Sign-In for iOS users and expand OAuth options. This will improve conversion during onboarding.

3. **Monitoring & Observability** – We will implement error tracking through Sentry, performance monitoring, and usage analytics. This helps us find issues before they affect users.

4. **Compliance Hardening** – The current system is GDPR-compliant by design through RLS policies and data minimization. Production deployment will add a consent management interface, data export functionality, and automated right-to-erasure (the right for users to delete their data).

---

## 10.4 Further Milestones (Technical Roadmap)

### AI-Based Proof Verification

A key planned feature is AI-powered image validation for photo proof. The system will use computer vision APIs to check submitted photos against challenge requirements. Examples:
- A cleanup action photo should show collected waste
- A flyer distribution photo should show distributed materials
- An event participation photo should show branded elements

This will reduce manual review work for NGOs while maintaining verification quality. The implementation has three phases:

- **Phase 1**: AI makes suggestions, NGO confirms (human-in-the-loop)
- **Phase 2**: AI approves high-confidence matches automatically, the NGO reviews edge cases
- **Phase 3**: Model improves continuously based on NGO feedback patterns

The financial plan projects this as a variable cost. It scales with platform usage at roughly €0.01–0.02 per validation call through cloud vision APIs. Manual NGO confirmation remains available for complex cases.

### Backend Infrastructure & Scalability

The infrastructure roadmap follows the cost structure from Chapter 7:

**Cloud Storage** – We currently use Supabase Storage. Future scaling may use AWS S3 for active media with 30-day hot storage. Older files would move to AWS Glacier for cheaper long-term storage. This optimizes cost based on access patterns.

**Data Transfer** – We plan for proof upload and download traffic. Image compression (0.7 quality) already reduces upload sizes by about 40%. Future improvements include progressive image loading and thumbnail generation.

**Monitoring & Security** – Production deployment will add automated data pipeline monitoring, security scanning, and incident response systems. Supabase provides built-in DDoS protection (defense against attack traffic) and SSL encryption.

**Real-Time Features** – The current Supabase Realtime setup supports pilot scale. Future improvements include push notifications through Expo Notifications. These will alert students when submissions are reviewed, when deadlines approach, and when team messages arrive.

### Advanced Platform Features

After validating the core workflow with pilot partners, we plan these capabilities:

**Matching Algorithm** – The system will match students to challenges based on interest profile, location (for on-site challenges), schedule, and completion history. This moves beyond manual browsing to proactive recommendations.

**A/B Testing Framework** – A systematic testing infrastructure will compare engagement flows, notification timing, reward structures, and design variants. Results will drive product improvements. This supports the data-driven approach from Chapter 8.4.

**Advanced Analytics** – Deeper organizational insights will include volunteer retention curves, optimal challenge duration analysis, category engagement trends, and predictive capacity planning. These analytics support the premium NGO tier from Chapter 5.4.

**Reward Partnerships** – A technical integration layer will enable partner companies to offer incentives (discounts, products, experiences) that students can redeem with XP. This supports the brand partnership stream from Chapter 5. It addresses the finding that 86% of students are comfortable with brand partnerships (see Chapter 2.3).

**Corporate Partner Dashboard** – A dedicated interface for sponsored challenge management. Corporate partners will be able to create branded challenges, monitor participation in real time, and download impact reports for ESG documentation.

### Timeline Alignment

The technical milestones map to the phases from Chapter 8 (see Roadmap Gantt Chart in Chapter 8):

| Phase | Period | Technical Focus |
|-------|--------|-----------------|
| **Start-up** | Q1–Q4 2026 | Production hardening, scaling infrastructure, enhanced monitoring, pilot support, Apple Sign-In |
| **Market Entry** | Q1 2027 | Mobile app store launch, AI verification v1 (human-in-the-loop), push notifications, A/B testing |
| **Expansion** | Q4 2027+ | Matching algorithm, advanced analytics, reward partnerships, corporate dashboard |

---

Each phase builds on what we learn in the previous stage. This ensures technical investment follows proven demand rather than speculation. This aligns with the lean startup methodology from Chapter 8.1.

---

## 10.5 Technical Risk Mitigation

The following technical measures address risks from Chapter 9:

| Risk | Mitigation |
|------|------------|
| **Platform activity risk** (9.2.1) | Real-time notifications keep users engaged. Gamification creates habit loops. Push notifications (planned) will re-engage inactive users. |
| **Supply-demand imbalance** (9.2.2) | Dashboard analytics identify matching gaps. Challenge templates reduce NGO effort. Recommendation algorithm (planned) will improve discovery. |
| **Verification cost risk** (9.2.3) | Tiered verification reduces manual effort. AI assistance (planned) will automate routine checks. Photo compression reduces storage costs. |
| **Competition risk** (9.2.5) | TypeScript monorepo enables rapid iteration. Shared codebase speeds up feature development. Modular architecture allows pivoting. |

---

## 10.6 Summary

The technical implementation shows that SolvTerra has progressed from concept to production-ready platform. Key achievements include:

- **Functional backend** with PostgreSQL database, real-time synchronization, and secure authentication
- **Cross-platform mobile app** supporting iOS and Android from a single codebase
- **Comprehensive NGO dashboard** for challenge management, submission review, and analytics
- **Platform administration portal** for organization verification and support
- **Security-first architecture** with 25 Row Level Security policies controlling data access
- **Bilingual support** enabling German and English users from day one
- **Gamification system** with XP rewards, five progression levels, and twelve achievement badges

This implementation supports the pilot phase objectives from Chapter 11. It provides the technical foundation for the market entry strategy from Chapter 8.

---

*Technical documentation last updated: January 2026*
*Codebase branch: ron | Backend: Supabase (PostgreSQL 15)*
