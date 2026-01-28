# Chapter 10

# Chapter 10 – Prototype / Technical Details

## 10.1 Platform Architecture & User Experience

SolvTerra consists of three user-facing components: a mobile application for student volunteers, a web dashboard for NGO administrators, and a public website for awareness and onboarding. Each interface serves the specific needs of its audience. All three share a unified data layer and design language.

### Public-Facing Website

The public website acts as the initial entry point for all stakeholders. It presents the SolvTerra mission, displays impact statistics, and provides dedicated sign-up paths for students and organizations. NGO partners can explore the platform's value proposition and start the registration process. Students find direct links to download the mobile application.

### Mobile Application (Student Interface)

The mobile application serves as the primary engagement surface for student volunteers. It guides new users through a progressive onboarding flow: a welcome screen presents core value propositions (quick micro-volunteering, XP rewards, community support). Users then create an account via social login (Google, Apple) or email registration, select interest categories, and complete an interactive tutorial.

The main application uses four navigation tabs:

**Discover** – This tab presents a curated feed of micro-volunteering opportunities. A dual-layer filter system lets students narrow results by duration (5, 10, 15, or 30 minutes), challenge type (digital or on-site), and interest category (environment, social, education, health, animals, culture). Duration-based colour coding provides instant visual orientation. Challenges of 5–10 minutes receive prominent lightning badges to lower the commitment threshold. This design directly addresses the time-constraint barrier identified in our market research.

**My Challenges** – A timeline-based view tracks active, pending, and completed challenges. Active challenges show urgency indicators with countdown timers as deadlines approach. The interface enforces an active challenge limit of three to prevent overcommitment and encourage completion.

**Community** – A verified social feed shows achievement posts (challenge completions, badge awards, level-ups, streaks), NGO promotions, and success stories. Unlike conventional social media, the platform verifies all posts. The reaction system uses meaningful responses (heart, celebrate, inspiring, thanks) instead of generic likes.

**Profile** – This tab shows the student's impact portfolio: XP progress toward the next level, completed challenge statistics, contributed hours, and a badge collection. Badges span milestone achievements, category specializations, streak rewards, and special achievements.

The challenge detail view shows task instructions, location and schedule details, contact person information, team composition for multi-person challenges, and verification requirements. Students submit proof of completion directly through the app. Depending on the challenge type, they upload a photo, write a text submission, or receive automated verification.

### Web Dashboard (NGO Command Center)

The web dashboard gives organizations a complete management interface. It is structured around five core sections:

**Dashboard** – An overview panel shows key performance indicators: active challenges, total participants, pending reviews, and volunteer hours. It also displays weekly activity charts and quick-action shortcuts.

**Challenges** – This section supports the full challenge lifecycle from creation to completion. The creation workflow offers template-based quick-start options (social media post, research task, cleanup action, team action). It also provides a multi-section form covering basic information, categorization, duration and XP allocation, verification method, location and meeting point details, scheduling, contact person assignment, team configuration with matchmaking, and custom tags. A real-time preview panel shows the challenge as students will see it.

**Submissions** – A review queue where NGOs evaluate student proof submissions. The interface supports star-based quality ratings (1–5), written feedback, and approve/reject workflows. Rejections require a mandatory reason.

**Community** – Organizations manage their public communications here. They can create challenge promotions with direct linking, share success stories, and post announcements. Posts can be pinned or highlighted for increased visibility.

**Statistics** – An analytics dashboard visualizes participation trends, category distribution, submission approval rates, time investment patterns, weekly activity, and top-performing challenges.

### Addressing Platform and Gamification Concerns

Early pilot feedback raised two specific concerns. Both informed subsequent design decisions.

First, pilot partners observed that the prototype appeared iOS-centric. In fact, the application uses Expo and React Native. These frameworks produce native applications for both iOS and Android from a single codebase. They also support web export. This cross-platform architecture ensures accessibility regardless of the student's device. The web dashboard uses Next.js and runs on any modern browser across all operating systems.

Second, pilot partners questioned the relevance of gamification from the NGO perspective. The XP and badge system is deliberately limited to the student-facing mobile application. It serves as an engagement and retention mechanism grounded in behavioural research. Our market analysis shows that 70% of students cite time commitment as a deterrent to volunteering. Gamification transforms micro-contributions into a visible, accumulating impact portfolio that sustains long-term participation. The NGO dashboard, by contrast, is a business-focused management tool. It contains no gamification elements and presents only operational metrics relevant to organizational decision-making.

---

## 10.2 MVP Level One (Development Milestone 1)

### Technology Stack

The platform uses a TypeScript monorepo managed with pnpm workspaces. This enforces strict type safety across all packages. The architecture consists of three packages:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Mobile App | Expo SDK 54, React Native, React Native Paper, Zustand, i18next | Student-facing cross-platform application |
| Web Dashboard | Next.js 14, shadcn/ui (Radix), Tailwind CSS, Recharts, Zustand | NGO management interface |
| Shared Package | TypeScript (types, constants, mock data) | Unified data models and business logic |

This architecture provides type-safe data contracts between applications. At the same time, it allows independent deployment and iteration of each interface.

### System Architecture

The shared package defines all data models (User, Organization, Challenge, Submission, CommunityPost), business constants (XP allocation rules, level thresholds, badge definitions, category configurations), and demonstration data. Both applications consume these shared definitions. This ensures consistency across the ecosystem.

**State Management** uses Zustand stores in both applications. We chose Zustand for its minimal boilerplate and predictable state updates. The mobile application adds AsyncStorage persistence for offline-capable language preferences and user session data.

**Internationalization** works at two levels. First, i18next handles application-level translations (navigation, UI labels, system messages) with namespace separation. Second, entity-level translations use suffixed fields on data models (for example, `title_en` and `description_en`). The system detects the device language via expo-localization and defaults to German. Users can switch languages manually. The preference persists across sessions.

**Verification System** supports three proof methods depending on the challenge configuration: geolocated photo uploads for on-site activities, text-based submissions for digital tasks, and manual NGO confirmation for complex assignments. This tiered approach balances automation with human oversight.

### Core MVP Features

The current prototype implements the complete core workflow:

1. **Challenge Lifecycle** – Creation with template support, multi-section configuration, publication, pause/resume, and completion tracking
2. **Submission Workflow** – Accept → In Progress → Submitted → Approved/Rejected, with proof upload, rating, and feedback
3. **Gamification Engine** – XP allocation by duration (10/20/30/50 XP for 5/10/15/30 minutes), five progression levels (Starter → Helper → Supporter → Champion → Legend), 12 achievement badges across four categories
4. **Multi-Person Challenges** – Team formation with size constraints, solo-join matchmaking, and invite workflows
5. **Community Platform** – Post types (promotions, stories, achievements), reaction system, commenting, pinning and highlighting
6. **Bilingual Support** – Full German/English coverage with device-language detection and manual override

### Incorporating Pilot Feedback

Based on NGO pilot interviews, we are implementing the following adjustments before submission:

- **Simplified onboarding**: Social login options (Google, Apple) remove the need for dedicated account creation. This directly addresses the feedback that "registration must be easy and fast" and that "volunteers should be able to sign up using an existing tool such as their Google account."
- **Platform clarity**: We now explicitly communicate that the mobile app serves iOS, Android, and web simultaneously through a single codebase.
- **Low-friction challenge creation**: Template-based quick-start reduces the effort to post a first challenge. This addresses the requirement for "minimal effort from our side" expressed by pilot NGOs.
- **Functional MVP as proof of concept**: The working prototype satisfies the prerequisite stated by pilot partners: "a clearly defined concept, a working MVP, and proof of volunteer interest."

---

## 10.3 Launch of Web-Platform / App

### Mobile Application Distribution

The mobile application uses Expo Application Services (EAS) for build and submission workflows. The deployment strategy includes three stages:

- **Beta Testing**: We distribute test builds through TestFlight (iOS) and internal testing tracks (Google Play) to pilot NGO partners and initial student cohorts.
- **Production Release**: After successful pilot validation, we publish simultaneously on the App Store and Google Play Store.
- **Continuous Delivery**: Expo Updates enables over-the-air (OTA) updates for rapid iteration without App Store review cycles. This allows same-day fixes and feature refinements.

### Web Dashboard Deployment

We deploy the Next.js dashboard via cloud hosting with a custom domain, SSL encryption, and CDN distribution. The rollout follows a progressive access model. Pilot NGOs receive early access during the start-up phase. Broader availability coincides with market entry. Each organization goes through a verification process to maintain platform trust and quality.

### From Prototype to Production

The transition from the current mock-data prototype to a production system requires four development streams:

1. **Backend API Development** – A RESTful API layer connects the frontend applications to persistent data storage. This replaces the current in-memory mock data with transactional database operations.
2. **Authentication & Identity** – OAuth 2.0 integration (Google, Apple) for students and email-based authentication for organizations. Role-based access control separates student, NGO, and platform administrator contexts.
3. **Data Persistence** – A relational database stores structured entities (users, organizations, challenges, submissions). Object storage holds media assets (proof photos, organization logos).
4. **Compliance & Security** – GDPR-compliant data handling covers consent management, data minimization, right-to-erasure mechanisms, and privacy-by-design architecture. This is critical for the German and European market.

---

## 10.4 Further Milestones (Technical Roadmap)

### AI-Based Proof Verification

A central planned enhancement is AI-powered image validation for photo-based proof submissions. The system will use computer vision APIs to automatically verify submitted photos against challenge requirements — for example, confirming a cleanup action, validating flyer distribution, or recognizing event participation. This reduces the manual review burden on NGOs while maintaining verification integrity. The financial plan projects this as a variable cost that scales with platform usage (approximately €0.01–0.02 per validation call). Manual NGO confirmation remains as a fallback for edge cases and complex assessments.

### Backend Infrastructure & Scalability

The infrastructure roadmap follows the cost structure defined in the financial plan:

- **Cloud Storage**: AWS S3 stores active media with 30-day hot retention. Automatic archival to AWS Glacier handles long-term storage. This optimizes cost against access patterns.
- **Data Transfer**: Bandwidth planning accounts for proof upload and download traffic. Costs scale with user growth.
- **Monitoring & Security**: Automated data pipeline monitoring, security services, and incident response infrastructure protect the platform.
- **Real-Time Features**: A push notification system handles submission updates, challenge reminders, and team coordination. WebSocket connections enable live community feed updates.

### Advanced Platform Features

After validating the core workflow, we plan the following capabilities for post-launch development:

- **Matching Algorithm**: The system matches students to challenges based on interest profile, geographic proximity, schedule availability, and completion history. This moves beyond the current manual browsing model.
- **A/B Testing Framework**: A systematic experimentation infrastructure tests engagement flows, notification timing, reward structures, and UX variants. Results feed directly into iterative product improvements.
- **Advanced Analytics**: Deeper organizational insights include volunteer retention curves, optimal challenge duration analysis, category engagement trends, and predictive capacity planning.
- **Reward Partnerships**: A technical integration layer enables partner companies to offer incentives (discounts, products, experiences) redeemable against accumulated XP. This supports the brand partnership stream defined in the revenue model.

### Timeline Alignment

The technical milestones map directly to the phases defined in Chapter 8:

| Phase | Period | Technical Focus |
|-------|--------|----------------|
| Start-up | Q1–Q4 2026 | Backend development, authentication, database, MVP hardening, pilot support |
| Market Entry | Q1 2027 | Mobile app store launch, AI verification v1, A/B testing, scaling infrastructure |
| Expansion | Q4 2027+ | Matching algorithm, advanced analytics, reward partnerships, team expansion |

Each phase builds on validated learnings from the previous stage. This ensures that technical investment follows proven demand rather than speculative feature development.
