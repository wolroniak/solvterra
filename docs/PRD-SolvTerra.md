# SolvTerra - Product Requirements Document (PRD)

**Version:** 0.1 (Draft)
**Date:** December 08, 2025
**Scope:** MVP Basic (Q1 2026) + MVP Full Version (Q2 2026)
**Status:** In Progress

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [User Stories & Use Cases](#4-user-stories--use-cases)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Constraints](#7-technical-constraints)
8. [Out of Scope / Future Considerations](#8-out-of-scope--future-considerations)
9. [Assumptions & Dependencies](#9-assumptions--dependencies)
10. [Milestones & Release Plan](#10-milestones--release-plan)

---

# 1. Overview & Vision

## 1.1 Company Vision

> **"A world where every person can make a measurable contribution to society with just 5 minutes of their time."**

SolvTerra pursues the vision of fundamentally transforming civic engagement. We believe that the desire to help exists in every person - but traditional volunteering models with rigid time commitments and high coordination effort stand in the way of this desire.

## 1.2 Product Vision

> **"SolvTerra is the platform that makes micro-volunteering as natural as checking social media - quick, flexible, rewarding, and impactful."**

We are building a two-sided marketplace that connects NGOs with students through bite-sized, meaningful tasks that can be completed in 5-30 minutes.

## 1.3 Problem Statement

**There is a massive gap in the volunteering ecosystem:**

NGOs have countless small but important tasks (5-30 minutes) that remain undone because traditional volunteering is too time-consuming to coordinate for such micro-work. At the same time, students have exactly these time windows available and want to help - but existing engagement models don't fit their lifestyle.

**The data validates this gap:**

| Finding | Source |
|---------|--------|
| 54% of students are currently NOT volunteering | Survey (n=50) |
| 74% were deterred from engagement by time requirements | Survey (n=50) |
| 76% don't know any engagement platforms | Survey (n=50) |
| 64% would perform 2-3 micro-actions per week | Survey (n=50) |

**No existing platform in Germany explicitly focuses on micro-volunteering with gamification and verification.** The market is fragmented with 15+ providers, but all are designed around traditional, longer-term volunteering commitments.

## 1.4 Solution

SolvTerra closes this gap through a **micro-volunteering platform** that:

1. **For NGOs** - Enables posting of small, clearly defined tasks ("micro-challenges")
2. **For Students** - Provides a mobile-first experience to discover and complete challenges in 5-30 minutes
3. **For Both** - Implements verification, gamification, and impact measurement

## 1.5 Value Proposition

### For NGOs (Primary Customers - B2B)

| Value | Description |
|-------|-------------|
| **Flexible Workforce** | Access to motivated volunteers without permanent employment |
| **Task Relief** | Offload small but important tasks that otherwise remain undone |
| **Documented Impact** | Verified engagement data for funding applications and annual reports |
| **Donor Pipeline** | Channel for acquiring young supporters who may become future donors |

### For Students (Primary Users - B2C)

| Value | Description |
|-------|-------------|
| **Meaningful Micro-Moments** | Use 5-30 minutes of free time for something that matters |
| **Full Flexibility** | Help when and where it fits your schedule |
| **Career Portfolio** | Documented engagement history for CV and job applications |
| **Community** | Connect with like-minded people who share your values |
| **Gamification** | Visible progress, recognition, and rewards |

### For Society

- Activation of unused engagement potential (54% of students currently inactive)
- Contribution to UN Sustainable Development Goals (SDG 10, 11, 17)
- Strengthening intergenerational cohesion

## 1.6 Scope of This PRD

This PRD covers the development of:

| Release | Timeline | Scope |
|---------|----------|-------|
| **MVP Basic** | Q1 2026 | Mobile App, Challenge System, Basic Gamification, Verification |
| **MVP Full Version** | Q2 2026 | Multi-Person Challenges, Community Feed, Extended Gamification |

Features planned for Q4 2026 and beyond (Impact Wrapped, Sponsored Challenges, Premium Tier) are documented in [Section 8: Out of Scope / Future Considerations](#8-out-of-scope--future-considerations).

---

# 2. Goals & Success Metrics

## 2.1 Primary Success Metrics (North Star)

These are the 5 core KPIs that define whether SolvTerra is succeeding. All product decisions should optimize for these metrics.

| # | Metric | Definition | Year 1 Target | Why It Matters |
|---|--------|------------|---------------|----------------|
| 1 | **Challenge Completion Rate** | % of accepted challenges that are verified complete | >80% | Core value delivery - if tasks aren't completed, NGOs leave |
| 2 | **30-Day Student Retention** | % of students active after 30 days | >40% | Indicates product-market fit and habit formation |
| 3 | **NGO Satisfaction Score** | Average quality rating of completed tasks | >4.0/5 | NGOs are paying customers - their satisfaction drives revenue |
| 4 | **Monthly Active Users (MAU)** | % of registered students active per month | >25% | Health of the user base |
| 5 | **Viral Coefficient** | New users acquired per existing user | >1.0 | Sustainable growth without excessive CAC |

## 2.2 Release-Specific Success Criteria

### MVP Basic (Q1 2026) - Go/No-Go Criteria

The MVP Basic release is successful and ready for MVP Full development when:

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Platform is functional | 0 critical bugs | QA sign-off |
| NGOs can create challenges | 10+ active NGOs | Dashboard count |
| Students can complete challenges | 500+ registered students | Database count |
| Basic verification works | 100+ verified completions | System logs |
| App Store presence | iOS + Android published | Store listings live |

**Go Decision:** All criteria must be met before MVP Full development resources are allocated.

### MVP Full Version (Q2 2026) - Go/No-Go Criteria

The MVP Full release is successful and ready for Phase 3 (Monetization) when:

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Core metrics healthy | Retention >30%, Completion >70% | Analytics |
| Social features adopted | 20%+ of challenges are multi-person | Feature analytics |
| Community engagement | 10%+ users active in feed weekly | Feed analytics |
| Scale achieved | 1,000+ completed challenges | Database count |
| NGO pipeline | 25+ active NGOs | Dashboard count |
| Student base | 2,000+ registered students | Database count |

**Go Decision:** All criteria must be met before Sponsored Challenges development begins.

## 2.3 Tracking Metrics by Stakeholder

### Student Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Registration-to-First-Challenge | % of registered users completing first challenge | >50% | Weekly |
| Challenges per Active User | Average challenges/month per active student | 3-5 | Monthly |
| Session Duration | Average time spent in app per session | 5-10 min | Weekly |
| Push Notification Opt-in | % of users with notifications enabled | >60% | Monthly |
| Social Feature Adoption | % of users using multi-person or feed | >30% | Monthly |
| Badges Earned | Average badges per active user | 2+ | Monthly |

### NGO Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Challenges Posted | Average challenges posted per NGO/month | 5+ | Monthly |
| Time-to-Completion | Average time from posting to verified completion | <72h | Weekly |
| NGO Retention Rate | % of NGOs active after 12 months | >80% | Quarterly |
| Repeat Usage | % of NGOs posting 2+ challenges/month | >60% | Monthly |
| Support Tickets | Issues raised per NGO/month | <1 | Monthly |

### Platform Health Metrics

| Metric | Definition | Target | Frequency |
|--------|------------|--------|-----------|
| Supply-Demand Ratio | Active challenges per active student | 0.5-2.0 | Weekly |
| Geographic Coverage | Cities with active challenges | 10+ | Monthly |
| Category Diversity | Challenge types represented | 5+ categories | Monthly |
| Platform Uptime | % time platform is available | >99.5% | Daily |
| App Store Rating | Average rating across iOS/Android | >4.0 | Weekly |

## 2.4 Financial Metrics (Year 1)

| Metric | Definition | Target |
|--------|------------|--------|
| Customer Acquisition Cost (Student) | Marketing spend / new students | <€5 |
| Customer Acquisition Cost (NGO) | Sales + marketing spend / new NGOs | <€100 |
| Burn Rate | Monthly operating costs | Within EXIST budget |
| Runway | Months of operation with current funding | >12 months |

> **Note:** Revenue metrics (LTV, MRR) become relevant in Phase 3 with Sponsored Challenges and Premium Tier. Year 1 focuses on user acquisition and engagement, funded by EXIST and other grants.

## 2.5 Anti-Metrics (What We Explicitly Do NOT Optimize For)

| Anti-Metric | Why We Avoid It |
|-------------|-----------------|
| Total Registrations (vanity) | Inactive users have no value - focus on active users |
| Time in App (excessive) | We want efficient 5-10 min sessions, not endless scrolling |
| Challenges Posted (without completion) | Unfulfilled challenges frustrate NGOs |
| Leaderboard Competition (forced) | 44% find rankings demotivating - keep opt-in |

---

# 3. User Personas

## 3.1 Student Personas (Primary Users)

Students are the users who complete challenges and generate value for NGOs. Without active students, the platform has no value - both marketplace sides are equally critical.

**Market Context:**
- ~2.9 million students in Germany
- Core target: 18-28 years, primarily Master's students
- 54% currently not active in volunteering
- 74% were deterred by time requirements of traditional volunteering

---

### Persona S1: "The Time-Pressed" (Der Zeitknappe)

| Attribute | Description |
|-----------|-------------|
| **Name** | Max, 24 |
| **Status** | Master's student in Business Informatics + 15h/week working student job |
| **Location** | Darmstadt |
| **Device** | iPhone, always on the go |

**Goals:**
- Wants to contribute to society but has maximum 30 minutes per week
- Needs something meaningful for his CV beyond academics and work
- Values efficiency - no long onboarding, no meetings, no commitments

**Pain Points:**
- Traditional volunteering requires fixed schedules he can't keep
- Feels guilty about not helping despite wanting to
- Previous attempts at volunteering failed due to time conflicts

**Behavior:**
- Checks phone during commute, between lectures, waiting times
- Prefers tasks he can complete in one sitting
- Appreciates clear instructions and quick feedback

**Quote:**
> "I want to help, but I can't commit to every Tuesday at 6pm. If I could help for 10 minutes on the train, I would."

**Features that serve this persona:**
- Micro-challenges (5-30 min)
- Mobile-first experience
- Clear time estimates on challenges
- Digital/remote task options

---

### Persona S2: "The Social Helper" (Die Soziale)

| Attribute | Description |
|-----------|-------------|
| **Name** | Lena, 22 |
| **Status** | Bachelor's student in Social Work |
| **Location** | Frankfurt |
| **Device** | Android, highly active on Instagram |

**Goals:**
- Wants to help together with friends - shared experiences matter
- Looking for a community of like-minded people
- Values the social aspect as much as the impact

**Pain Points:**
- Volunteering alone feels isolating
- Hard to coordinate group activities with existing platforms
- Wants to share her engagement on social media but lacks content

**Behavior:**
- Does activities with friends whenever possible
- Active in WhatsApp groups, shares experiences
- Motivated by seeing what friends are doing

**Quote:**
> "Helping is more fun together. If my friends were on there, I'd definitely do more."

**Features that serve this persona:**
- Multi-Person Challenges (MVP Full)
- Community Feed (MVP Full)
- Challenge Partner Matching (MVP Full)
- Shareable achievements and Impact Wrapped (Phase 3)
- Team profiles and group statistics

---

### Persona S3: "The Achievement Hunter" (Der Gamifier)

| Attribute | Description |
|-----------|-------------|
| **Name** | Tim, 21 |
| **Status** | Bachelor's student in Computer Science |
| **Location** | Munich |
| **Device** | Android, plays mobile games regularly |

**Goals:**
- Motivated by visible progress and achievements
- Wants recognition for his contributions
- Enjoys competition (but fair, skill-based)

**Pain Points:**
- Traditional volunteering offers no visible progress tracking
- His contributions feel invisible and unrecognized
- Gets bored without goals and milestones

**Behavior:**
- Checks leaderboards in games he plays
- Collects achievements and badges
- Sets personal goals and tracks progress

**Quote:**
> "Show me my stats. How many people have I helped? What's my rank? Give me something to work toward."

**Features that serve this persona:**
- Points (XP) system (MVP Basic)
- Badges and certificates (MVP Basic)
- Level system (MVP Full)
- Streaks for consistency (MVP Full)
- Leaderboards - opt-in (MVP Full)
- Personal statistics and impact dashboard

---

### Persona Distribution Hypothesis

Based on survey data, we estimate the following distribution:

| Persona | Estimated % | Key Driver |
|---------|-------------|------------|
| The Time-Pressed | 50% | Flexibility, efficiency |
| The Social Helper | 30% | Community, shared experiences |
| The Achievement Hunter | 20% | Gamification, recognition |

> **Note:** These are hypotheses to be validated post-launch through user research and analytics.

---

## 3.2 NGO Personas (Primary Customers)

NGOs are the paying customers who post challenges. Their satisfaction directly determines platform revenue potential.

**Market Context:**
- ~600,000 registered associations (eingetragene Vereine) in Germany
- **Sweet Spot: Organizations with 10-500 employees** - large enough to have micro-tasks, small enough to lack dedicated volunteer coordinators
- Estimated 15,000-25,000 NGOs with digital needs

---

### Persona N1: "The Small Association" (Der kleine Verein)

| Attribute | Description |
|-----------|-------------|
| **Organization** | Local environmental group |
| **Size** | 3 paid staff, 20 volunteers |
| **Location** | Regional (e.g., Rhein-Main area) |
| **Budget** | Limited, primarily grant-funded |

**Goals:**
- Get help with tasks that don't justify hiring
- Find young people who might become long-term supporters
- Spend minimal time on coordination

**Pain Points:**
- No capacity for volunteer management
- Traditional volunteer recruitment is time-consuming
- Young volunteers are hard to find and keep

**Tasks they would post:**
- Social media content creation
- Flyer distribution for events
- Short research tasks
- Event photography

**Quote:**
> "We have so many small things that just don't get done. We can't hire someone for 2 hours of work, but it would help us enormously."

**Features that serve this persona:**
- Simple challenge creation (templates)
- Minimal onboarding time
- Free tier access
- Quality verification to trust strangers

---

### Persona N2: "The Mid-Size NGO" (Die mittlere NGO) ⭐ PRIMARY TARGET

| Attribute | Description |
|-----------|-------------|
| **Organization** | Regional welfare organization |
| **Size** | 25 paid staff, 100+ volunteers |
| **Location** | State-wide presence |
| **Budget** | Moderate, mixed funding |

**Goals:**
- Offload micro-tasks that fall through the cracks
- Document volunteer engagement for funders
- Modernize volunteer coordination

**Pain Points:**
- Many small tasks pile up because they don't fit existing volunteer structures
- Needs documented impact for grant applications
- Current volunteer base is aging

**Tasks they would post:**
- Translation of materials
- Data entry and research
- Survey distribution
- Content creation for multiple channels
- Event support across locations

**Quote:**
> "We have dozens of small tasks every week that our regular volunteers don't have time for. We need flexible help on demand."

**Features that serve this persona:**
- Impact Dashboard with export for funding applications
- Multi-challenge management
- Quality ratings and verification
- Volunteer statistics and reporting
- Premium features (Phase 3)

> ⭐ **This is our Sweet Spot persona.** Mid-size NGOs have enough volume to generate consistent challenge supply while being small enough to value the platform's efficiency gains.

---

### Persona N3: "The Large Organization" (Die große Organisation)

| Attribute | Description |
|-----------|-------------|
| **Organization** | National humanitarian organization |
| **Size** | 200+ paid staff, 1,000+ volunteers |
| **Location** | Nationwide |
| **Budget** | Significant, diversified funding |

**Goals:**
- Reach young demographics for donor pipeline
- Support local chapters with flexible volunteers
- Measure and report national volunteer impact

**Pain Points:**
- Hard to engage Gen Z through traditional channels
- Local chapters need help but central coordination is difficult
- Need consistent quality across decentralized operations

**Tasks they would post:**
- National campaigns (coordinated micro-actions)
- Local chapter support
- Awareness spreading on social media
- Survey and feedback collection

**Quote:**
> "We need a channel to the next generation. They're not joining traditional volunteer programs, but we know they want to help."

**Features that serve this persona:**
- Multi-location support
- Campaign management (multiple related challenges)
- Aggregated impact reporting
- API access for integration (Phase 3)
- Sponsored Challenges for brand campaigns (Phase 3)

---

### NGO Prioritization for Launch

| Priority | Persona | Reason |
|----------|---------|--------|
| 🥇 PRIMARY | Mid-Size NGO (N2) | Sweet spot - volume + need alignment |
| 🥈 SECONDARY | Small Association (N1) | Easy to onboard, good for testimonials |
| 🥉 LATER | Large Organization (N3) | Longer sales cycles, complex requirements |

---

## 3.3 Corporate Partners (Future - Phase 3)

Corporate partners are NOT a primary target group for MVP but represent a future monetization opportunity through Sponsored Challenges.

### Persona C1: "The CSR Manager" (Placeholder)

| Attribute | Description |
|-----------|-------------|
| **Role** | Corporate Social Responsibility Manager |
| **Company Size** | 500+ employees |
| **Budget** | €5,000-50,000/year for CSR initiatives |

**Goals:**
- Measurable social impact for sustainability reports
- Employee engagement opportunities
- Brand visibility among young demographics

**Relevant Features (Phase 3):**
- Sponsored Challenges with branding
- Impact reports for CSR documentation
- Employee volunteering programs

> **Note:** Detailed corporate persona development will occur in Phase 2 when preparing for Sponsored Challenges launch.

---

## 3.4 Persona-Feature Matrix

| Feature | Time-Pressed (S1) | Social Helper (S2) | Achievement Hunter (S3) | Small NGO (N1) | Mid-Size NGO (N2) |
|---------|-------------------|--------------------|-----------------------|----------------|-------------------|
| Mobile App | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | - | - |
| Micro-Challenges (5-30 min) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Points/XP | ⭐ | ⭐ | ⭐⭐⭐ | - | - |
| Badges | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | - | - |
| Multi-Person Challenges | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Community Feed | ⭐ | ⭐⭐⭐ | ⭐⭐ | - | - |
| Leaderboards (opt-in) | - | ⭐ | ⭐⭐⭐ | - | - |
| Simple Challenge Creation | - | - | - | ⭐⭐⭐ | ⭐⭐ |
| Impact Dashboard | - | - | - | ⭐⭐ | ⭐⭐⭐ |
| Verification System | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

Legend: ⭐⭐⭐ = Critical, ⭐⭐ = Important, ⭐ = Nice to have, - = Not relevant

---

# 4. User Stories & Use Cases

This chapter defines the user stories for MVP Basic and MVP Full Version, organized by feature area. Each story follows the format:

> **As a** [persona], **I want to** [action], **so that** [benefit].

Stories are tagged with their target release: `[MVP Basic]` or `[MVP Full]`

---

## 4.1 Critical User Flows

Before diving into individual stories, here are the 4 critical user journeys that define the core platform experience:

### Flow 1: Student Challenge Completion (Core Loop)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Open App   │───▶│  Browse     │───▶│  View       │───▶│  Accept     │
│             │    │  Feed       │    │  Details    │    │  Challenge  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                         │                                      │
                         ▼                                      ▼
                   ┌─────────────┐                        ┌─────────────┐
                   │  Filter by  │                        │  Complete   │
                   │  Category   │                        │  Task       │
                   └─────────────┘                        └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Receive    │◀───│  NGO        │◀───│  Submit     │◀───│  Upload     │
│  XP+Badge   │    │  Confirms   │    │  for Review │    │  Proof      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Critical Metrics for this flow:**
- Time from app open to challenge acceptance: <2 minutes
- Challenge completion rate: >80%
- Time from submission to NGO confirmation: <72 hours

---

### Flow 2: NGO Challenge Creation

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Login to   │───▶│  Click      │───▶│  Select     │───▶│  Fill       │
│  Dashboard  │    │  "New"      │    │  Template   │    │  Details    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                            │                   │
                                            ▼                   ▼
                                      ┌─────────────┐    ┌─────────────┐
                                      │  Or: Start  │    │  Set Time   │
                                      │  from Blank │    │  Estimate   │
                                      └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Challenge  │◀───│  Publish    │◀───│  Preview    │◀───│  Choose     │
│  Live       │    │  Challenge  │    │  Challenge  │    │  Verify     │
└─────────────┘    └─────────────┘    └─────────────┘    │  Method     │
                                                         └─────────────┘
```

**Critical Metrics for this flow:**
- Time to create first challenge: <10 minutes
- Challenge publication rate: >90% of started
- Challenges with clear instructions: >95%

---

### Flow 3: Student Onboarding (First-Time User)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Download   │───▶│  Open App   │───▶│  Sign Up    │───▶│  Select     │
│  App        │    │  First Time │    │  (Email/    │    │  Interests  │
└─────────────┘    └─────────────┘    │  Social)    │    │  (Optional) │
                                      └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Becomes    │◀───│  Complete   │◀───│  Accept     │◀───│  See        │
│  Active     │    │  First      │    │  Suggested  │    │  Suggested  │
│  User       │    │  Challenge  │    │  Challenge  │    │  Challenge  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Critical Metrics for this flow:**
- Sign-up completion rate: >70%
- Time to first challenge acceptance: <5 minutes
- First challenge completion rate: >50%

---

### Flow 4: Multi-Person Challenge (MVP Full)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  See Multi- │───▶│  View       │───▶│  Invite     │───▶│  Friends    │
│  Person     │    │  Details    │    │  Friends    │    │  Accept     │
│  Challenge  │    │             │    │  (or Match) │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                            │                   │
                                            ▼                   ▼
                                      ┌─────────────┐    ┌─────────────┐
                                      │  Find       │    │  Group      │
                                      │  Partner    │    │  Formed     │
                                      │  via Match  │    │             │
                                      └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  All Get    │◀───│  NGO        │◀───│  All Submit │◀───│  Complete   │
│  XP+Badge   │    │  Confirms   │    │  Together   │    │  Together   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Critical Metrics for this flow:**
- Multi-person challenge adoption: >20% of challenges
- Group formation success rate: >60%
- Multi-person completion rate: >75%

---

## 4.2 Onboarding Stories

### Student Onboarding

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-ON-01 | As a new student, I want to sign up with my email or social login, so that I can start quickly without friction. | `[MVP Basic]` | All |
| S-ON-02 | As a new student, I want to optionally select my interests (environment, social, education, etc.), so that I see relevant challenges. | `[MVP Basic]` | S1, S3 |
| S-ON-03 | As a new student, I want to see a quick tutorial (max 3 screens), so that I understand how the app works. | `[MVP Basic]` | All |
| S-ON-04 | As a new student, I want to be suggested an easy first challenge, so that I can experience success quickly. | `[MVP Basic]` | All |
| S-ON-05 | As a new student, I want to invite friends during onboarding, so that we can help together. | `[MVP Full]` | S2 |

### NGO Onboarding

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| N-ON-01 | As a new NGO admin, I want to register my organization with basic info, so that I can start posting challenges. | `[MVP Basic]` | All |
| N-ON-02 | As a new NGO admin, I want to verify my organization (e.g., via domain email), so that students can trust us. | `[MVP Basic]` | All |
| N-ON-03 | As a new NGO admin, I want to see example challenges and templates, so that I understand what works well. | `[MVP Basic]` | N1 |
| N-ON-04 | As a new NGO admin, I want to add team members with different roles, so that we can share the workload. | `[MVP Full]` | N2, N3 |

---

## 4.3 Challenge Discovery Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-CD-01 | As a student, I want to see a feed of available challenges, so that I can browse opportunities. | `[MVP Basic]` | All |
| S-CD-02 | As a student, I want to filter challenges by category (environment, social, education, etc.), so that I find relevant tasks. | `[MVP Basic]` | All |
| S-CD-03 | As a student, I want to filter challenges by time required (5, 10, 15, 30 min), so that I find tasks that fit my schedule. | `[MVP Basic]` | S1 |
| S-CD-04 | As a student, I want to filter challenges by type (digital/remote vs. on-site), so that I can choose based on my situation. | `[MVP Basic]` | S1 |
| S-CD-05 | As a student, I want to see the NGO's profile and rating, so that I can trust who I'm helping. | `[MVP Basic]` | All |
| S-CD-06 | As a student, I want to see how many people have completed a challenge, so that I know it's legitimate. | `[MVP Basic]` | S3 |
| S-CD-07 | As a student, I want to save challenges for later, so that I can come back when I have time. | `[MVP Basic]` | S1 |
| S-CD-08 | As a student, I want to see challenges my friends have completed, so that I can do the same. | `[MVP Full]` | S2 |
| S-CD-09 | As a student, I want to filter for multi-person challenges, so that I can find activities to do with friends. | `[MVP Full]` | S2 |
| S-CD-10 | As a student, I want personalized challenge recommendations based on my history, so that I find relevant tasks faster. | `[MVP Full]` | All |

---

## 4.4 Challenge Completion Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-CC-01 | As a student, I want to accept a challenge with one tap, so that I can commit quickly. | `[MVP Basic]` | All |
| S-CC-02 | As a student, I want to see clear instructions for the challenge, so that I know exactly what to do. | `[MVP Basic]` | All |
| S-CC-03 | As a student, I want to upload a photo as proof of completion, so that the NGO can verify my work. | `[MVP Basic]` | All |
| S-CC-04 | As a student, I want to submit text/content as proof (for research/translation tasks), so that I can complete digital tasks. | `[MVP Basic]` | S1 |
| S-CC-05 | As a student, I want to see my pending submissions and their status, so that I know what's being reviewed. | `[MVP Basic]` | All |
| S-CC-06 | As a student, I want to receive a push notification when my submission is approved, so that I get instant feedback. | `[MVP Basic]` | All |
| S-CC-07 | As a student, I want to cancel an accepted challenge if I can't complete it, so that others can take it. | `[MVP Basic]` | All |
| S-CC-08 | As a student, I want to see a timer/deadline for my accepted challenge, so that I know how much time I have. | `[MVP Basic]` | S1 |
| S-CC-09 | As a student in a group, I want to coordinate with my challenge partners, so that we complete together. | `[MVP Full]` | S2 |
| S-CC-10 | As a student, I want to submit proof with GPS location for on-site challenges, so that verification is easier. | `[MVP Full]` | All |

---

## 4.5 Gamification Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-GM-01 | As a student, I want to earn XP points for completed challenges, so that I see my progress grow. | `[MVP Basic]` | S3 |
| S-GM-02 | As a student, I want to earn badges for achievements (first challenge, category completion, etc.), so that I have goals to work toward. | `[MVP Basic]` | S3 |
| S-GM-03 | As a student, I want to see my total impact stats (challenges completed, hours contributed), so that I understand my contribution. | `[MVP Basic]` | All |
| S-GM-04 | As a student, I want to download/share my badges as images, so that I can show them on LinkedIn/CV. | `[MVP Basic]` | S1, S3 |
| S-GM-05 | As a student, I want to see my current level and progress to next level, so that I have long-term goals. | `[MVP Full]` | S3 |
| S-GM-06 | As a student, I want to maintain streaks for consistent engagement, so that I stay motivated. | `[MVP Full]` | S3 |
| S-GM-07 | As a student, I want to optionally see leaderboards (friends, university, global), so that I can compare myself to others. | `[MVP Full]` | S3 |
| S-GM-08 | As a student, I want to hide my ranking from leaderboards, so that I don't feel pressured. | `[MVP Full]` | S1, S2 |
| S-GM-09 | As a student, I want to earn partner rewards/discounts for achievements, so that I get tangible benefits. | `[MVP Full]` | All |

---

## 4.6 Social & Community Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-SO-01 | As a student, I want to see a community feed of recent activity, so that I feel part of a movement. | `[MVP Full]` | S2 |
| S-SO-02 | As a student, I want to follow other users, so that I see what they're doing. | `[MVP Full]` | S2 |
| S-SO-03 | As a student, I want to share my achievements in the feed, so that others can see my impact. | `[MVP Full]` | S2, S3 |
| S-SO-04 | As a student, I want to find challenge partners through matching, so that I don't do multi-person challenges alone. | `[MVP Full]` | S2 |
| S-SO-05 | As a student, I want to create/join a team with friends, so that we can see our combined impact. | `[MVP Full]` | S2 |
| S-SO-06 | As a student, I want to invite friends via link/WhatsApp/Instagram, so that we can help together. | `[MVP Full]` | S2 |
| S-SO-07 | As a student, I want to comment on feed posts, so that I can interact with the community. | `[MVP Full]` | S2 |
| S-SO-08 | As a student, I want to see team leaderboards, so that groups can compete. | `[MVP Full]` | S2, S3 |

---

## 4.7 NGO Challenge Management Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| N-CM-01 | As an NGO admin, I want to create a new challenge with title, description, and time estimate, so that students know what to do. | `[MVP Basic]` | All |
| N-CM-02 | As an NGO admin, I want to select a challenge template (social media, research, flyer, etc.), so that I create challenges faster. | `[MVP Basic]` | N1 |
| N-CM-03 | As an NGO admin, I want to specify the verification method (photo, text, NGO confirmation), so that I get appropriate proof. | `[MVP Basic]` | All |
| N-CM-04 | As an NGO admin, I want to set how many students can accept a challenge, so that I control capacity. | `[MVP Basic]` | All |
| N-CM-05 | As an NGO admin, I want to set a deadline for challenge completion, so that time-sensitive tasks get done. | `[MVP Basic]` | N2, N3 |
| N-CM-06 | As an NGO admin, I want to review and approve/reject submitted proofs, so that I ensure quality. | `[MVP Basic]` | All |
| N-CM-07 | As an NGO admin, I want to provide feedback on submissions, so that students can improve. | `[MVP Basic]` | All |
| N-CM-08 | As an NGO admin, I want to duplicate past challenges, so that I can quickly post recurring tasks. | `[MVP Full]` | N2 |
| N-CM-09 | As an NGO admin, I want to create multi-person challenges (requiring 2+ students), so that tasks needing coordination get done. | `[MVP Full]` | N2, N3 |
| N-CM-10 | As an NGO admin, I want to see all my active/completed challenges in a dashboard, so that I have an overview. | `[MVP Basic]` | All |

---

## 4.8 NGO Impact & Reporting Stories

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| N-IR-01 | As an NGO admin, I want to see basic statistics (challenges posted, completed, pending), so that I track activity. | `[MVP Basic]` | All |
| N-IR-02 | As an NGO admin, I want to rate completed submissions (1-5 stars), so that I can give feedback and help the platform improve. | `[MVP Basic]` | All |
| N-IR-03 | As an NGO admin, I want to see an impact dashboard with volunteer hours and engagement metrics, so that I can report to funders. | `[MVP Full]` | N2, N3 |
| N-IR-04 | As an NGO admin, I want to export impact reports as PDF, so that I can include them in grant applications. | `[MVP Full]` | N2, N3 |
| N-IR-05 | As an NGO admin, I want to see which students are most active with my organization, so that I can recognize top contributors. | `[MVP Full]` | N2 |

---

## 4.9 Account & Profile Stories

### Student Profile

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| S-PR-01 | As a student, I want to edit my profile (name, photo, bio), so that NGOs and other users know who I am. | `[MVP Basic]` | All |
| S-PR-02 | As a student, I want to see my engagement portfolio (all completed challenges, badges, stats), so that I can track my journey. | `[MVP Basic]` | All |
| S-PR-03 | As a student, I want to set my notification preferences, so that I control how I'm contacted. | `[MVP Basic]` | All |
| S-PR-04 | As a student, I want to export my portfolio as PDF, so that I can add it to job applications. | `[MVP Full]` | S1 |
| S-PR-05 | As a student, I want to set my profile visibility (public/private), so that I control who sees my activity. | `[MVP Full]` | All |
| S-PR-06 | As a student, I want to delete my account and data, so that I can leave the platform cleanly. | `[MVP Basic]` | All |

### NGO Profile

| ID | User Story | Release | Persona |
|----|------------|---------|---------|
| N-PR-01 | As an NGO admin, I want to edit my organization's profile (logo, description, mission), so that students know who we are. | `[MVP Basic]` | All |
| N-PR-02 | As an NGO admin, I want to see my organization's rating (based on student feedback), so that I can improve. | `[MVP Full]` | All |
| N-PR-03 | As an NGO admin, I want to manage team member access, so that the right people can create/review challenges. | `[MVP Full]` | N2, N3 |

---

## 4.10 Story Summary by Release

### MVP Basic - Total: 47 Stories

| Category | Count |
|----------|-------|
| Onboarding | 7 |
| Challenge Discovery | 7 |
| Challenge Completion | 8 |
| Gamification | 4 |
| NGO Management | 10 |
| NGO Reporting | 2 |
| Profiles | 7 |
| Social | 0 |

### MVP Full - Total: 32 Stories

| Category | Count |
|----------|-------|
| Onboarding | 2 |
| Challenge Discovery | 3 |
| Challenge Completion | 2 |
| Gamification | 5 |
| Social & Community | 8 |
| NGO Management | 2 |
| NGO Reporting | 3 |
| Profiles | 4 |

---

# 5. Functional Requirements

This chapter specifies the functional requirements organized by product interface. Each requirement includes acceptance criteria to enable clear implementation and testing.

**Requirement ID Format:** `[Interface]-[Category]-[Number]`
- `APP` = Student Mobile App
- `WEB` = NGO Web Dashboard
- `API` = Backend/API
- `ADM` = Admin Panel

---

## 5.1 Data Model Overview

Before diving into functional requirements, here is a high-level overview of the core entities:

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Student                    │  NGO Admin                │  Admin        │
│  - id                       │  - id                     │  - id         │
│  - email                    │  - email                  │  - email      │
│  - name                     │  - name                   │  - role       │
│  - avatar                   │  - organization_id        │               │
│  - interests[]              │  - role (owner/member)    │               │
│  - xp_total                 │                           │               │
│  - level                    │                           │               │
│  - created_at               │                           │               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           ORGANIZATIONS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Organization                                                            │
│  - id                                                                    │
│  - name                                                                  │
│  - description                                                           │
│  - logo_url                                                              │
│  - website                                                               │
│  - verified (boolean)                                                    │
│  - rating_avg                                                            │
│  - created_at                                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            CHALLENGES                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Challenge                                                               │
│  - id                                                                    │
│  - organization_id (FK)                                                  │
│  - title                                                                 │
│  - description                                                           │
│  - instructions                                                          │
│  - category (enum: environment, social, education, health, other)        │
│  - type (enum: digital, onsite)                                          │
│  - duration_minutes (5, 10, 15, 30)                                      │
│  - verification_method (enum: photo, text, ngo_confirmation)             │
│  - max_participants                                                      │
│  - current_participants                                                  │
│  - is_multi_person (boolean) [MVP Full]                                  │
│  - min_group_size [MVP Full]                                             │
│  - deadline (optional)                                                   │
│  - xp_reward                                                             │
│  - status (enum: draft, active, completed, archived)                     │
│  - created_at                                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           SUBMISSIONS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Submission                                                              │
│  - id                                                                    │
│  - challenge_id (FK)                                                     │
│  - student_id (FK)                                                       │
│  - group_id (FK, optional) [MVP Full]                                    │
│  - status (enum: accepted, in_progress, submitted, approved, rejected)   │
│  - proof_type (enum: photo, text, none)                                  │
│  - proof_url / proof_text                                                │
│  - gps_location (optional) [MVP Full]                                    │
│  - submitted_at                                                          │
│  - reviewed_at                                                           │
│  - ngo_rating (1-5)                                                      │
│  - ngo_feedback                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           GAMIFICATION                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Badge                        │  XP_Transaction           │  Streak     │
│  - id                         │  - id                     │  - id       │
│  - name                       │  - student_id (FK)        │  - student  │
│  - description                │  - amount                 │  - type     │
│  - icon_url                   │  - source (challenge,     │  - count    │
│  - criteria                   │    badge, streak)         │  - last_    │
│  - category                   │  - source_id              │    active   │
│                               │  - created_at             │             │
├───────────────────────────────┴───────────────────────────┴─────────────┤
│  Student_Badge (junction)                                                │
│  - student_id                                                            │
│  - badge_id                                                              │
│  - earned_at                                                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         SOCIAL [MVP Full]                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Team                         │  Feed_Post                │  Follow     │
│  - id                         │  - id                     │  - id       │
│  - name                       │  - author_id              │  - follower │
│  - members[]                  │  - type (achievement,     │  - followed │
│  - created_by                 │    challenge, badge)      │  - created  │
│                               │  - content                │             │
│                               │  - created_at             │             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Entity Relationships

```
Student ──────┬──── completes ────▶ Submission ◀──── belongs_to ──── Challenge
              │                          │                               │
              │                          │                               │
              ├──── earns ──────▶ Badge  │                               │
              │                          │                               │
              ├──── has ────────▶ XP_Transaction                         │
              │                                                          │
              └──── follows ────▶ Student [MVP Full]                     │
                                                                         │
Organization ─┬──── has_many ───▶ NGO_Admin                              │
              │                                                          │
              └──── creates ─────────────────────────────────────────────┘
```

---

## 5.2 Student Mobile App (APP)

### 5.2.1 Authentication & Onboarding

#### APP-AUTH-01: User Registration
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Students can create an account using email or social login |
| **Acceptance Criteria** | |
| | - Email registration with password (min 8 chars, 1 uppercase, 1 number) |
| | - Social login options: Google, Apple (iOS), optional: Instagram |
| | - Email verification required before full access |
| | - Terms of service and privacy policy acceptance required |
| | - Duplicate email check with clear error message |

#### APP-AUTH-02: User Login
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Students can log in to their existing account |
| **Acceptance Criteria** | |
| | - Login via email/password or social provider |
| | - "Remember me" option for persistent login |
| | - Password reset via email link |
| | - Biometric login (Face ID/Touch ID) after first login |
| | - Session expires after 30 days of inactivity |

#### APP-AUTH-03: Interest Selection
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | New users can select interest categories during onboarding |
| **Acceptance Criteria** | |
| | - Categories: Environment, Social, Education, Health, Animals, Culture, Other |
| | - Multi-select allowed (minimum 0, no maximum) |
| | - Skip option available |
| | - Can be edited later in settings |
| | - Interests influence challenge feed sorting |

#### APP-AUTH-04: Onboarding Tutorial
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | First-time users see a brief tutorial explaining the app |
| **Acceptance Criteria** | |
| | - Maximum 3 screens |
| | - Skip button on all screens |
| | - Progress indicator (dots) |
| | - Covers: Find challenges → Complete → Earn XP/Badges |
| | - Only shown once (flag stored) |

---

### 5.2.2 Challenge Discovery

#### APP-DISC-01: Challenge Feed
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Main screen showing available challenges |
| **Acceptance Criteria** | |
| | - Scrollable list/card view of challenges |
| | - Each card shows: Title, NGO name, category icon, duration, XP reward |
| | - Pull-to-refresh functionality |
| | - Infinite scroll with pagination (20 items per page) |
| | - Empty state when no challenges available |
| | - Default sort: Newest first, weighted by user interests |

#### APP-DISC-02: Challenge Filters
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users can filter the challenge feed |
| **Acceptance Criteria** | |
| | - Filter by category (multi-select) |
| | - Filter by duration (5, 10, 15, 30 min - multi-select) |
| | - Filter by type (digital/on-site) |
| | - Active filters shown as chips, removable |
| | - "Clear all" option |
| | - Filter state persists during session |

#### APP-DISC-03: Challenge Detail View
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Full details of a selected challenge |
| **Acceptance Criteria** | |
| | - Title, full description, detailed instructions |
| | - NGO profile card (name, logo, rating, tap to view) |
| | - Category, duration, type, XP reward |
| | - Number of completions / remaining slots |
| | - Verification method explained |
| | - "Accept Challenge" CTA button |
| | - Share button |
| | - Save/bookmark button |

#### APP-DISC-04: Saved Challenges
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users can save challenges for later |
| **Acceptance Criteria** | |
| | - Bookmark icon on challenge cards and detail view |
| | - Saved challenges accessible from profile/menu |
| | - Visual indicator if challenge becomes unavailable |
| | - Unsave option |

#### APP-DISC-05: Multi-Person Challenge Filter
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Filter to show only challenges for groups |
| **Acceptance Criteria** | |
| | - Toggle/filter for "With friends" challenges |
| | - Multi-person challenges show required group size |
| | - Badge/icon indicating multi-person on cards |

---

### 5.2.3 Challenge Completion

#### APP-COMP-01: Accept Challenge
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | User commits to completing a challenge |
| **Acceptance Criteria** | |
| | - Single tap/button to accept |
| | - Confirmation dialog with deadline info |
| | - Challenge moves to "My Challenges" (in-progress) |
| | - Slot decremented in real-time |
| | - Push notification permission prompt (if not granted) |

#### APP-COMP-02: My Challenges View
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | List of user's active and completed challenges |
| **Acceptance Criteria** | |
| | - Tabs: In Progress / Pending Review / Completed |
| | - In Progress shows: Time remaining, instructions access |
| | - Pending shows: Submission status, waiting indicator |
| | - Completed shows: XP earned, badge earned (if any), rating received |

#### APP-COMP-03: Photo Upload Verification
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Submit photo proof of challenge completion |
| **Acceptance Criteria** | |
| | - Camera capture or gallery selection |
| | - Supported formats: JPG, PNG, HEIC |
| | - Max file size: 10MB (compress if larger) |
| | - Timestamp embedded in metadata |
| | - Preview before submission |
| | - Optional caption/note |
| | - Progress indicator during upload |
| | - Retry on failure |

#### APP-COMP-04: Text Submission Verification
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Submit text/content as proof (research, translations) |
| **Acceptance Criteria** | |
| | - Text input field (min 50 chars, max 5000 chars) |
| | - Character count indicator |
| | - Save draft option |
| | - File attachment option (PDF, DOC, max 5MB) |
| | - Preview before submission |

#### APP-COMP-05: Submission Status Tracking
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Track status of submitted proofs |
| **Acceptance Criteria** | |
| | - Status states: Submitted → Under Review → Approved/Rejected |
| | - Visual timeline/progress indicator |
| | - Timestamp for each state change |
| | - NGO feedback visible when reviewed |

#### APP-COMP-06: Cancel Accepted Challenge
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | User can withdraw from an accepted challenge |
| **Acceptance Criteria** | |
| | - Cancel button in My Challenges (in-progress) |
| | - Confirmation dialog with warning |
| | - Slot released for other users |
| | - No penalty for first 3 cancellations |
| | - Cancellation counter visible in profile (internal metric) |

#### APP-COMP-07: GPS Location Verification
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Attach GPS location to on-site challenge submissions |
| **Acceptance Criteria** | |
| | - Location permission request |
| | - GPS coordinates attached to photo submissions |
| | - Map preview showing submission location |
| | - Optional: Challenge can specify required location radius |

---

### 5.2.4 Gamification

#### APP-GAME-01: XP System
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users earn experience points for completed challenges |
| **Acceptance Criteria** | |
| | - XP amount shown on challenge cards |
| | - XP awarded immediately upon NGO approval |
| | - Animated XP gain notification |
| | - Total XP visible in profile |
| | - XP breakdown by source available |

#### APP-GAME-02: Badge System
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users earn badges for achievements |
| **Acceptance Criteria** | |
| | - MVP Badges: First Challenge, 5/10/25 Challenges, Category badges |
| | - Badge earned notification with animation |
| | - Badge collection view in profile |
| | - Unearned badges shown as locked (progress visible) |
| | - Badge detail: Name, description, earned date |

#### APP-GAME-03: Impact Statistics
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users see their overall contribution stats |
| **Acceptance Criteria** | |
| | - Total challenges completed |
| | - Total hours contributed (sum of durations) |
| | - Total XP earned |
| | - Badges earned count |
| | - NGOs supported count |
| | - Stats displayed on profile |

#### APP-GAME-04: Badge Sharing
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Export/share badges as images |
| **Acceptance Criteria** | |
| | - Download badge as PNG image |
| | - Share to Instagram Stories, LinkedIn, WhatsApp |
| | - Badge image includes SolvTerra branding |
| | - Deep link back to profile (optional) |

#### APP-GAME-05: Level System
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | XP thresholds unlock user levels |
| **Acceptance Criteria** | |
| | - Levels: Starter → Helper → Supporter → Champion → Legend |
| | - XP thresholds: 0, 100, 500, 2000, 5000 |
| | - Level-up animation and notification |
| | - Level badge displayed on profile |
| | - Progress bar to next level |

#### APP-GAME-06: Streak System
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Track consecutive days/weeks of activity |
| **Acceptance Criteria** | |
| | - Daily streak: Complete 1+ challenge per day |
| | - Weekly streak: Complete 1+ challenge per week |
| | - Streak counter visible on home/profile |
| | - Streak freeze: 1 free skip per week |
| | - Bonus XP for maintaining streaks (7-day: +50 XP) |

#### APP-GAME-07: Leaderboards (Opt-in)
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Compare rankings with others |
| **Acceptance Criteria** | |
| | - Opt-in during onboarding or settings |
| | - Leaderboard types: Friends, Global, Monthly |
| | - Shows: Rank, name, avatar, XP |
| | - Own position highlighted |
| | - Top 10 + own position always visible |
| | - Hide from leaderboard option |

---

### 5.2.5 Social Features [MVP Full]

#### APP-SOC-01: Community Feed
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Activity feed showing community engagement |
| **Acceptance Criteria** | |
| | - Feed shows: Completed challenges, badges earned, milestones |
| | - Posts from followed users prioritized |
| | - Like/react to posts |
| | - Pull-to-refresh |
| | - Infinite scroll |

#### APP-SOC-02: Follow System
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Follow other users to see their activity |
| **Acceptance Criteria** | |
| | - Follow button on user profiles |
| | - Followers/Following counts visible |
| | - Activity from followed users in feed |
| | - Unfollow option |

#### APP-SOC-03: Friend Invite
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Invite friends to join the platform |
| **Acceptance Criteria** | |
| | - Generate shareable invite link |
| | - Share via WhatsApp, Instagram, SMS, copy link |
| | - Referral tracking (bonus XP when friend joins) |
| | - Invite from contacts (optional) |

#### APP-SOC-04: Multi-Person Challenge Group
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Form groups for multi-person challenges |
| **Acceptance Criteria** | |
| | - Invite friends via link/username |
| | - Accept/decline group invitation |
| | - Group chat for coordination |
| | - All members must accept before challenge starts |
| | - All members submit individually, all must complete |

#### APP-SOC-05: Challenge Partner Matching
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Find partners for multi-person challenges |
| **Acceptance Criteria** | |
| | - "Find Partner" button on multi-person challenges |
| | - Match based on interests, location (optional) |
| | - Preview partner profile before accepting |
| | - Accept/decline match |
| | - Alternative: Public "looking for partner" list |

#### APP-SOC-06: Teams
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Create persistent friend groups |
| **Acceptance Criteria** | |
| | - Create team with name |
| | - Invite members via link |
| | - Team has combined stats (total XP, challenges) |
| | - Team leaderboard |
| | - Leave team option |

---

### 5.2.6 Profile & Settings

#### APP-PROF-01: Edit Profile
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Users can customize their profile |
| **Acceptance Criteria** | |
| | - Edit: Name, bio (max 150 chars), avatar |
| | - Avatar upload or select from presets |
| | - University/city (optional, for leaderboards) |
| | - Interests selection |
| | - Changes saved immediately |

#### APP-PROF-02: Portfolio View
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | View complete engagement history |
| **Acceptance Criteria** | |
| | - All completed challenges with dates |
| | - All earned badges |
| | - Impact statistics |
| | - NGOs supported list |
| | - Filterable by time period |

#### APP-PROF-03: Notification Settings
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Control push notification preferences |
| **Acceptance Criteria** | |
| | - Toggle: New challenges in interests |
| | - Toggle: Submission reviewed |
| | - Toggle: Friend activity (MVP Full) |
| | - Toggle: Streak reminders |
| | - Quiet hours setting |

#### APP-PROF-04: Portfolio Export
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Download portfolio as PDF |
| **Acceptance Criteria** | |
| | - Generate PDF with: Name, stats, challenges, badges |
| | - Professional layout for CV attachment |
| | - Include QR code linking to public profile |
| | - Download or share options |

#### APP-PROF-05: Privacy Settings
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Control profile visibility |
| **Acceptance Criteria** | |
| | - Profile visibility: Public / Friends only / Private |
| | - Hide from leaderboards option |
| | - Control what appears in community feed |

#### APP-PROF-06: Account Deletion
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Delete account and all data |
| **Acceptance Criteria** | |
| | - GDPR-compliant data deletion |
| | - Confirmation required (type "DELETE") |
| | - Grace period: 30 days before permanent deletion |
| | - Email confirmation sent |
| | - All personal data removed, anonymous stats retained |

---

## 5.3 NGO Web Dashboard (WEB)

### 5.3.1 Authentication & Onboarding

#### WEB-AUTH-01: Organization Registration
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | NGOs create an account for their organization |
| **Acceptance Criteria** | |
| | - Admin registers with email + password |
| | - Organization details: Name, website, description |
| | - Logo upload (JPG/PNG, max 2MB) |
| | - Category selection (type of NGO) |
| | - Email verification required |

#### WEB-AUTH-02: Organization Verification
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Verify legitimacy of registered organizations |
| **Acceptance Criteria** | |
| | - Domain email verification (auto-verify if email matches website domain) |
| | - Manual verification option for non-matching emails |
| | - Upload verification documents (registration certificate) |
| | - Verification status visible: Pending / Verified |
| | - Verified badge shown to students |

#### WEB-AUTH-03: Team Member Management
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Add and manage team members |
| **Acceptance Criteria** | |
| | - Invite team members via email |
| | - Roles: Owner, Admin, Member |
| | - Member can: Create challenges, review submissions |
| | - Admin can: All member permissions + invite others |
| | - Owner can: All admin permissions + delete organization |
| | - Remove team members |

---

### 5.3.2 Challenge Management

#### WEB-CHAL-01: Create Challenge
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Create a new micro-challenge |
| **Acceptance Criteria** | |
| | - Title (max 80 chars) |
| | - Description (max 500 chars) - what and why |
| | - Instructions (max 2000 chars) - step by step |
| | - Category selection |
| | - Type: Digital or On-site |
| | - Duration: 5, 10, 15, or 30 minutes |
| | - Verification method selection |
| | - Max participants (1-100) |
| | - XP reward (auto-calculated based on duration) |
| | - Deadline (optional) |
| | - Save as draft or publish immediately |

#### WEB-CHAL-02: Challenge Templates
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Pre-built templates for common challenge types |
| **Acceptance Criteria** | |
| | - Templates: Social Media, Research, Flyer Distribution, Event Photo, Survey, Translation |
| | - Template pre-fills description, instructions, verification method |
| | - Can customize all fields after selection |
| | - "Start from blank" option |

#### WEB-CHAL-03: Challenge Dashboard
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Overview of all organization's challenges |
| **Acceptance Criteria** | |
| | - Tabs: Draft / Active / Completed / Archived |
| | - Each row shows: Title, participants, completion rate, status |
| | - Quick actions: Edit, Archive, Duplicate |
| | - Search and filter by status, date |
| | - Bulk actions (archive multiple) |

#### WEB-CHAL-04: Edit Challenge
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Modify an existing challenge |
| **Acceptance Criteria** | |
| | - Edit all fields while in draft |
| | - Active challenges: Can edit description, instructions, deadline, max participants |
| | - Cannot reduce max participants below current count |
| | - Cannot change verification method after publication |
| | - Version history (optional) |

#### WEB-CHAL-05: Duplicate Challenge
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Create a copy of an existing challenge |
| **Acceptance Criteria** | |
| | - Duplicate button on any challenge |
| | - Creates new draft with "[Copy]" prefix in title |
| | - All fields copied except: Participants, submissions |
| | - Opens in edit mode |

#### WEB-CHAL-06: Multi-Person Challenge Creation
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Create challenges requiring multiple students |
| **Acceptance Criteria** | |
| | - Toggle: "Requires group" |
| | - Set minimum group size (2-10) |
| | - Instructions for group coordination |
| | - All group members must submit |
| | - XP awarded to each member on completion |

---

### 5.3.3 Submission Review

#### WEB-SUB-01: Submission Queue
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | View all pending submissions for review |
| **Acceptance Criteria** | |
| | - List of submissions awaiting review |
| | - Sort by: Date submitted, challenge |
| | - Filter by challenge, date range |
| | - Submission count indicator in navigation |
| | - Quick preview of submission content |

#### WEB-SUB-02: Review Submission
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Review and approve/reject a submission |
| **Acceptance Criteria** | |
| | - View submitted proof (photo/text) |
| | - View challenge instructions for reference |
| | - Approve or Reject buttons |
| | - Quality rating (1-5 stars) required on approval |
| | - Feedback text (optional, required on rejection) |
| | - Student is notified of decision |

#### WEB-SUB-03: Bulk Review
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Review multiple submissions at once |
| **Acceptance Criteria** | |
| | - Select multiple submissions |
| | - Bulk approve with same rating |
| | - Confirmation before bulk action |

---

### 5.3.4 Impact & Reporting

#### WEB-REP-01: Basic Statistics
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Overview statistics on dashboard |
| **Acceptance Criteria** | |
| | - Challenges: Total, active, completed |
| | - Submissions: Pending, approved, rejected |
| | - Volunteer hours contributed |
| | - Average rating received |
| | - Time period selector (week, month, all time) |

#### WEB-REP-02: Impact Dashboard
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Detailed analytics and visualizations |
| **Acceptance Criteria** | |
| | - Charts: Submissions over time, category breakdown |
| | - Volunteer engagement metrics |
| | - Average completion time |
| | - Top performing challenges |
| | - Student demographics (aggregated, anonymized) |

#### WEB-REP-03: Report Export
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Export impact report as PDF |
| **Acceptance Criteria** | |
| | - Date range selection |
| | - PDF includes: Summary stats, charts, challenge list |
| | - Formatted for grant applications |
| | - Organization branding included |
| | - Download or email option |

#### WEB-REP-04: Top Contributors
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | View most active students |
| **Acceptance Criteria** | |
| | - List of students by challenges completed for organization |
| | - Shows: Name (or anonymous), challenges count, total hours |
| | - Respects student privacy settings |
| | - Option to send thank you (future) |

---

### 5.3.5 Organization Profile

#### WEB-ORG-01: Edit Organization Profile
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Manage organization public profile |
| **Acceptance Criteria** | |
| | - Edit: Name, description, mission statement |
| | - Upload/update logo |
| | - Website, social media links |
| | - Contact email (public) |
| | - Categories/focus areas |
| | - Preview as students see it |

#### WEB-ORG-02: View Organization Rating
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | See how students rate the organization |
| **Acceptance Criteria** | |
| | - Overall rating (average of all submission ratings) |
| | - Rating distribution breakdown |
| | - Recent feedback comments (if enabled) |
| | - Rating trend over time |

---

## 5.4 Backend/API (API)

### 5.4.1 Core API Requirements

#### API-CORE-01: RESTful API
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | API architecture and standards |
| **Acceptance Criteria** | |
| | - RESTful design principles |
| | - JSON request/response format |
| | - Versioned endpoints (v1/) |
| | - Consistent error response format |
| | - Rate limiting (100 req/min default) |
| | - Request/response logging |

#### API-CORE-02: Authentication
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Secure authentication system |
| **Acceptance Criteria** | |
| | - JWT-based authentication |
| | - Access token (15 min expiry) + Refresh token (30 days) |
| | - Token refresh endpoint |
| | - Secure password hashing (bcrypt) |
| | - OAuth 2.0 for social login |

#### API-CORE-03: File Upload
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Handle file uploads (photos, documents) |
| **Acceptance Criteria** | |
| | - Presigned URL upload to cloud storage |
| | - File type validation |
| | - Size limits enforced |
| | - Automatic image compression |
| | - CDN delivery for fast access |

#### API-CORE-04: Push Notifications
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Send push notifications to mobile apps |
| **Acceptance Criteria** | |
| | - FCM (Firebase Cloud Messaging) integration |
| | - APNs for iOS |
| | - Notification types: Submission reviewed, new challenge, streak reminder |
| | - User preference respect |
| | - Notification history stored |

#### API-CORE-05: Real-time Updates
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Real-time data synchronization |
| **Acceptance Criteria** | |
| | - WebSocket support for live updates |
| | - Challenge slot count updates |
| | - Feed new posts |
| | - Group chat messages |
| | - Fallback to polling if WebSocket unavailable |

---

### 5.4.2 Business Logic

#### API-BIZ-01: Challenge Matching
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Algorithm for challenge feed sorting |
| **Acceptance Criteria** | |
| | - Primary: User interests match |
| | - Secondary: Recency (newer first) |
| | - Exclude: Already accepted/completed by user |
| | - Exclude: Full challenges (max participants reached) |
| | - Exclude: Expired challenges |

#### API-BIZ-02: XP Calculation
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Calculate XP rewards |
| **Acceptance Criteria** | |
| | - Base XP: 5 min = 10 XP, 10 min = 20 XP, 15 min = 30 XP, 30 min = 50 XP |
| | - Bonus: First challenge of day +10 XP |
| | - Bonus: Streak milestone +50 XP (7-day) |
| | - XP transaction logged with source |

#### API-BIZ-03: Badge Award Logic
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Automatic badge assignment |
| **Acceptance Criteria** | |
| | - Trigger check after each challenge completion |
| | - MVP Badges: First Challenge, 5/10/25 Completions, Category Master (5 in one category) |
| | - Prevent duplicate awards |
| | - Badge earned event triggers notification |

#### API-BIZ-04: Streak Calculation
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Track and maintain user streaks |
| **Acceptance Criteria** | |
| | - Daily streak: Reset at midnight local time if no completion |
| | - Weekly streak: Reset on Monday if no completion previous week |
| | - Streak freeze: 1 automatic per week |
| | - Streak broken notification |

---

## 5.5 Admin Panel (ADM)

### 5.5.1 Platform Administration

#### ADM-01: NGO Verification Queue
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Review and verify pending organizations |
| **Acceptance Criteria** | |
| | - List of pending verification requests |
| | - View submitted documents |
| | - Approve or reject with reason |
| | - Organization notified of decision |

#### ADM-02: Content Moderation
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Review reported content |
| **Acceptance Criteria** | |
| | - Flag system for challenges and submissions |
| | - Review queue for flagged content |
| | - Actions: Remove, warn, suspend |
| | - Notification to affected parties |

#### ADM-03: User Management
**Release:** `[MVP Basic]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Manage platform users |
| **Acceptance Criteria** | |
| | - Search users by email, name |
| | - View user details and activity |
| | - Suspend/unsuspend accounts |
| | - Delete accounts (GDPR requests) |
| | - Impersonate for debugging (with logging) |

#### ADM-04: Platform Analytics
**Release:** `[MVP Full]`

| Aspect | Specification |
|--------|---------------|
| **Description** | Platform-wide metrics and health |
| **Acceptance Criteria** | |
| | - Active users (DAU, WAU, MAU) |
| | - Challenge completion rates |
| | - NGO activity levels |
| | - Growth trends |
| | - System health indicators |

---

# 6. Non-Functional Requirements

This chapter defines the quality attributes and constraints that specify HOW the system should perform, not WHAT it does. Requirements are tiered by release phase with Year 2 targets for future planning.

---

## 6.1 Performance Requirements

### NFR-PERF-01: Page/Screen Load Time

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| Mobile app cold start | <4 seconds | <3 seconds | <2 seconds |
| Mobile app warm start | <2 seconds | <1.5 seconds | <1 second |
| Challenge feed load | <3 seconds | <2 seconds | <1.5 seconds |
| NGO dashboard load | <4 seconds | <3 seconds | <2 seconds |
| Image upload (10MB) | <10 seconds | <8 seconds | <5 seconds |

**Measurement:** 90th percentile on 4G mobile connection / 50 Mbps desktop

### NFR-PERF-02: API Response Time

| Endpoint Type | MVP Basic | MVP Full | Year 2 Target |
|---------------|-----------|----------|---------------|
| Read operations (GET) | <500ms | <300ms | <200ms |
| Write operations (POST/PUT) | <800ms | <500ms | <300ms |
| Search/filter operations | <1000ms | <600ms | <400ms |
| File upload presigned URL | <300ms | <200ms | <150ms |

**Measurement:** 95th percentile, measured at API gateway

### NFR-PERF-03: Mobile App Performance

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| App size (iOS/Android) | <80 MB | <100 MB | <120 MB |
| Memory usage (active) | <150 MB | <200 MB | <250 MB |
| Battery drain (1h active use) | <8% | <6% | <5% |
| Offline capability | None | Challenge cache | Full offline mode |

### NFR-PERF-04: Concurrent Users

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| Concurrent mobile users | 500 | 2,000 | 10,000 |
| Concurrent NGO dashboard users | 50 | 200 | 500 |
| API requests/second (sustained) | 100 | 500 | 2,000 |
| API requests/second (peak) | 200 | 1,000 | 5,000 |

---

## 6.2 Scalability Requirements

### NFR-SCALE-01: Data Volume

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| Registered students | 3,000 | 10,000 | 50,000 |
| Registered NGOs | 50 | 150 | 500 |
| Total challenges | 500 | 2,000 | 10,000 |
| Total submissions | 10,000 | 50,000 | 500,000 |
| Image storage | 50 GB | 200 GB | 2 TB |

### NFR-SCALE-02: Horizontal Scaling

| Aspect | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| API instances | 1-2 | 2-4 | Auto-scaling (2-20) |
| Database | Single instance | Read replica | Multi-region |
| CDN | Basic | Regional | Global |
| Load balancing | Basic | With health checks | Geographic routing |

### NFR-SCALE-03: Growth Accommodation

| Requirement | Specification |
|-------------|---------------|
| Architecture | Stateless API servers for horizontal scaling |
| Database | Schema supports sharding by organization_id |
| Storage | Cloud-native object storage (S3/GCS) |
| Queue | Async job processing for notifications, exports |

---

## 6.3 Availability Requirements

### NFR-AVAIL-01: Uptime Targets

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| API availability | 99% | 99.5% | 99.9% |
| Allowed monthly downtime | ~7.2 hours | ~3.6 hours | ~43 minutes |
| Planned maintenance window | Sunday 2-6 AM CET | Sunday 3-5 AM CET | Rolling updates |

### NFR-AVAIL-02: Recovery Objectives

| Metric | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| RTO (Recovery Time Objective) | 4 hours | 2 hours | 30 minutes |
| RPO (Recovery Point Objective) | 24 hours | 4 hours | 1 hour |
| Backup frequency | Daily | Every 6 hours | Continuous |
| Backup retention | 7 days | 30 days | 90 days |

### NFR-AVAIL-03: Disaster Recovery

| Aspect | MVP Basic | MVP Full | Year 2 Target |
|--------|-----------|----------|---------------|
| Data backup location | Same region, different AZ | Different region | Multi-region active |
| Failover | Manual | Semi-automatic | Automatic |
| DR testing | Quarterly | Monthly | Continuous |

---

## 6.4 Security Requirements

### NFR-SEC-01: Authentication & Authorization

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Password policy | Min 8 chars, 1 uppercase, 1 number | MVP Basic |
| Password storage | bcrypt with cost factor 12 | MVP Basic |
| Session management | JWT with 15min access / 30 day refresh | MVP Basic |
| Multi-factor authentication | Optional for NGO admins | MVP Full |
| OAuth 2.0 | Google, Apple, (Instagram optional) | MVP Basic |
| Role-based access control | Student, NGO Member, NGO Admin, Platform Admin | MVP Basic |

### NFR-SEC-02: Data Protection

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Data encryption at rest | AES-256 | MVP Basic |
| Data encryption in transit | TLS 1.3 | MVP Basic |
| PII data handling | Encrypted, access-logged | MVP Basic |
| Data anonymization | For analytics and exports | MVP Full |
| Right to deletion | GDPR Art. 17 compliant, 30-day grace | MVP Basic |
| Data portability | Export user data as JSON | MVP Full |

### NFR-SEC-03: DSGVO/GDPR Compliance

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Privacy policy | Clear, accessible, German + English | MVP Basic |
| Cookie consent | Banner with granular options | MVP Basic |
| Data processing records | Maintained and auditable | MVP Basic |
| DPO (Data Protection Officer) | Designated contact | MVP Basic |
| Consent management | Explicit opt-in for marketing | MVP Basic |
| Data subject requests | Automated handling within 30 days | MVP Full |

### NFR-SEC-04: Application Security

| Requirement | Specification | Release |
|-------------|---------------|---------|
| OWASP Top 10 | All vulnerabilities addressed | MVP Basic |
| Input validation | Server-side, whitelist approach | MVP Basic |
| SQL injection prevention | Parameterized queries / ORM | MVP Basic |
| XSS prevention | Output encoding, CSP headers | MVP Basic |
| CSRF protection | Token-based | MVP Basic |
| Rate limiting | 100 req/min per user, 1000/min per IP | MVP Basic |
| Dependency scanning | Automated in CI/CD | MVP Basic |
| Penetration testing | Annual | Year 2 |

### NFR-SEC-05: Infrastructure Security

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Network isolation | VPC with private subnets | MVP Basic |
| Secrets management | Environment variables / Vault | MVP Basic |
| Admin access | VPN + MFA required | MVP Basic |
| Audit logging | All admin actions logged | MVP Basic |
| Security monitoring | Log aggregation, alerts | MVP Full |
| WAF (Web Application Firewall) | Basic rules | Year 2 |

---

## 6.5 Usability Requirements

### NFR-USE-01: Accessibility

| Requirement | MVP Basic | MVP Full | Year 2 Target |
|-------------|-----------|----------|---------------|
| WCAG compliance | Level A | Level AA | Level AA+ |
| Screen reader support | Basic | Full | Full |
| Color contrast | 4.5:1 minimum | 4.5:1 minimum | 7:1 for key elements |
| Font scaling | Respects system settings | Respects system settings | In-app settings |
| Keyboard navigation (web) | Full | Full | Full |

### NFR-USE-02: Internationalization

| Requirement | MVP Basic | MVP Full | Year 2 Target |
|-------------|-----------|----------|---------------|
| Languages supported | German, English | German, English | + French, Spanish |
| Date/time format | Localized | Localized | User preference |
| Number format | Localized | Localized | User preference |
| RTL support | No | No | Prepared |
| Translation management | Static files | CMS-based | CMS + community |

### NFR-USE-03: User Experience

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Mobile-first design | Primary interface is mobile app | MVP Basic |
| Responsive web | NGO dashboard works on tablet+ | MVP Basic |
| Error messages | Clear, actionable, localized | MVP Basic |
| Loading states | Skeleton screens, spinners | MVP Basic |
| Empty states | Helpful guidance, CTAs | MVP Basic |
| Onboarding | Max 3 screens, skippable | MVP Basic |
| Form validation | Inline, real-time | MVP Basic |

### NFR-USE-04: Offline Behavior

| Requirement | MVP Basic | MVP Full | Year 2 Target |
|-------------|-----------|----------|---------------|
| No connection handling | Clear error message | Cached challenge list | Full offline mode |
| Draft saving | Server-side only | Local + sync | Local + sync |
| Queue submissions | No | Queue for sync | Queue with retry |

---

## 6.6 Maintainability Requirements

### NFR-MAINT-01: Code Quality

| Requirement | Specification | Release |
|-------------|---------------|---------|
| Code coverage (unit tests) | >60% | MVP Basic |
| Code coverage (integration) | >40% | MVP Full |
| Linting | ESLint/Prettier enforced | MVP Basic |
| Type safety | TypeScript strict mode | MVP Basic |
| Code review | Required for all PRs | MVP Basic |
| Documentation | README, API docs, architecture | MVP Basic |

### NFR-MAINT-02: Monitoring & Observability

| Requirement | MVP Basic | MVP Full | Year 2 Target |
|-------------|-----------|----------|---------------|
| Application logging | Structured JSON logs | + Log aggregation | + Log analytics |
| Error tracking | Sentry or equivalent | + Alerting | + RCA automation |
| APM (Application Performance) | Basic metrics | Full tracing | Distributed tracing |
| Uptime monitoring | Ping checks | + Synthetic tests | + Real user monitoring |
| Alerting | Email | + Slack/PagerDuty | + Escalation policies |

### NFR-MAINT-03: Deployment

| Requirement | Specification | Release |
|-------------|---------------|---------|
| CI/CD pipeline | Automated build, test, deploy | MVP Basic |
| Deployment frequency | On-demand, at least weekly | MVP Basic |
| Rollback capability | One-click rollback | MVP Basic |
| Feature flags | Basic toggle system | MVP Full |
| Blue-green deployment | No | Optional | Required |
| Database migrations | Versioned, reversible | MVP Basic |

### NFR-MAINT-04: Documentation

| Requirement | Specification | Release |
|-------------|---------------|---------|
| API documentation | OpenAPI/Swagger | MVP Basic |
| Architecture decision records | For major decisions | MVP Basic |
| Runbooks | For common operations | MVP Full |
| Incident response | Documented procedure | MVP Full |

---

## 6.7 Compatibility Requirements

### NFR-COMPAT-01: Mobile App

| Platform | MVP Basic | MVP Full | Year 2 Target |
|----------|-----------|----------|---------------|
| iOS minimum version | iOS 14+ | iOS 14+ | iOS 15+ |
| Android minimum version | Android 8+ (API 26) | Android 8+ | Android 9+ |
| Tablet support | Scaled phone UI | Optimized | Native tablet UI |

### NFR-COMPAT-02: Web Dashboard

| Browser | MVP Basic | MVP Full |
|---------|-----------|----------|
| Chrome | Last 2 versions | Last 2 versions |
| Firefox | Last 2 versions | Last 2 versions |
| Safari | Last 2 versions | Last 2 versions |
| Edge | Last 2 versions | Last 2 versions |
| IE 11 | Not supported | Not supported |

### NFR-COMPAT-03: Screen Sizes

| Device | Minimum Width | Optimized |
|--------|---------------|-----------|
| Mobile (Student App) | 320px | 375px - 428px |
| Tablet | 768px | 768px - 1024px |
| Desktop (NGO Dashboard) | 1024px | 1280px+ |

---

## 6.8 NFR Summary by Priority

| Priority | Category | Key Metric | MVP Basic Target |
|----------|----------|------------|------------------|
| 🔴 Critical | Security | OWASP Top 10, DSGVO | Full compliance |
| 🔴 Critical | Availability | Uptime | 99% |
| 🟠 High | Performance | API response | <500ms |
| 🟠 High | Performance | App load | <4s |
| 🟡 Medium | Scalability | Concurrent users | 500 |
| 🟡 Medium | Usability | WCAG | Level A |
| 🟢 Lower | Maintainability | Code coverage | >60% |

---

# 7. Technical Constraints & Recommendations

This chapter provides technology recommendations with rationale. These are guidelines, not mandates - the development team may choose alternatives if they have specific expertise or compelling reasons.

---

## 7.1 Tech Stack Recommendations

### 7.1.1 Mobile App

| Aspect | Recommendation | Alternative | Rationale |
|--------|----------------|-------------|-----------|
| **Framework** | React Native | Flutter | Cross-platform reduces dev effort by ~40%; large ecosystem; TypeScript support enables code sharing with backend |
| **State Management** | Zustand or Redux Toolkit | - | Lightweight, TypeScript-first; Redux if team prefers |
| **Navigation** | React Navigation | - | De facto standard for React Native |
| **UI Components** | React Native Paper or NativeBase | Tamagui | Material Design compliance; good accessibility |
| **Offline Storage** | AsyncStorage + WatermelonDB | MMKV | WatermelonDB for MVP Full offline sync |

**Key Considerations:**
- React Native chosen over Flutter due to larger talent pool in Germany
- TypeScript mandatory for code quality and maintainability
- Expo recommended for faster development (managed workflow initially)

### 7.1.2 NGO Web Dashboard

| Aspect | Recommendation | Alternative | Rationale |
|--------|----------------|-------------|-----------|
| **Framework** | Next.js 14+ (App Router) | Remix | React ecosystem consistency; excellent TypeScript support; built-in SSR/SSG |
| **UI Library** | shadcn/ui + Tailwind CSS | Chakra UI | Highly customizable; no runtime overhead; accessible by default |
| **State Management** | TanStack Query (React Query) | SWR | Superior caching, offline support, devtools |
| **Forms** | React Hook Form + Zod | Formik | Performance; type-safe validation |
| **Charts** | Recharts | Chart.js | React-native integration; declarative API |

**Key Considerations:**
- Next.js enables future SEO optimization for public NGO profiles
- Tailwind allows rapid UI iteration without CSS bloat
- shadcn/ui provides accessible, customizable components

### 7.1.3 Backend API

| Aspect | Recommendation | Alternative | Rationale |
|--------|----------------|-------------|-----------|
| **Runtime** | Node.js 20 LTS | Bun | Mature ecosystem; team familiarity; TypeScript native |
| **Framework** | NestJS | Fastify, Express | Enterprise-grade; built-in DI, validation, OpenAPI; TypeScript-first |
| **ORM** | Prisma | TypeORM, Drizzle | Type-safe queries; excellent DX; auto-migrations |
| **Validation** | class-validator + class-transformer | Zod | NestJS integration; decorator-based |
| **API Documentation** | Swagger/OpenAPI (via @nestjs/swagger) | - | Auto-generated from decorators |

**Alternative: Python Stack**
If the team has stronger Python expertise:

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| **Framework** | FastAPI | Async, auto-docs, type hints |
| **ORM** | SQLAlchemy 2.0 | Mature, flexible |
| **Validation** | Pydantic | Built into FastAPI |

### 7.1.4 Database

| Aspect | Recommendation | Alternative | Rationale |
|--------|----------------|-------------|-----------|
| **Primary Database** | PostgreSQL 15+ | - | JSONB for flexible schemas; excellent performance; free |
| **Cache** | Redis | Memcached | Session storage, rate limiting, pub/sub for real-time |
| **Search (Phase 2+)** | PostgreSQL Full-Text | Elasticsearch | Start simple; upgrade if needed |

**Schema Design Principles:**
- UUIDs for primary keys (security, distributed-ready)
- Soft deletes for GDPR compliance (deleted_at timestamp)
- Audit columns on all tables (created_at, updated_at, created_by)

### 7.1.5 File Storage

| Aspect | Recommendation | Alternative | Rationale |
|--------|----------------|-------------|-----------|
| **Object Storage** | AWS S3 | Cloudflare R2, GCS | Industry standard; presigned URLs; lifecycle policies |
| **CDN** | CloudFront | Cloudflare | Tight S3 integration; global edge locations |
| **Image Processing** | Sharp (server) or imgproxy | Cloudinary | Cost control; privacy (self-hosted) |

**Cost Consideration:** Cloudflare R2 has zero egress fees - consider for Phase 2+ if image volume is high.

---

## 7.2 Third-Party Services

### 7.2.1 Authentication

| Service | Recommendation | Alternative | Rationale |
|---------|----------------|-------------|-----------|
| **Auth Provider** | Supabase Auth or Auth0 (Free tier) | Firebase Auth, Clerk | Supabase: OSS, generous free tier; Auth0: enterprise features |
| **Social Login** | Google, Apple (required for iOS) | - | Apple Sign-In required by App Store if social login offered |

**Build vs. Buy:** For MVP, use a managed auth service. Building custom auth is error-prone and time-consuming.

### 7.2.2 Push Notifications

| Service | Recommendation | Rationale |
|---------|----------------|-----------|
| **Provider** | Firebase Cloud Messaging (FCM) | Free; works for both iOS and Android; reliable |
| **iOS** | APNs via FCM | FCM handles APNs integration |

**Note:** FCM is free with generous limits (no cost for notifications).

### 7.2.3 Email

| Service | Recommendation | Alternative | Rationale |
|---------|----------------|-------------|-----------|
| **Transactional Email** | Resend | SendGrid, Postmark | Modern API; generous free tier (3k/month); great DX |
| **Templates** | React Email | MJML | Component-based; TypeScript |

### 7.2.4 Analytics & Monitoring

| Service | Recommendation | Alternative | Rationale |
|---------|----------------|-------------|-----------|
| **Product Analytics** | PostHog (self-hosted) or Mixpanel | Amplitude | PostHog: GDPR-friendly, self-hostable; Mixpanel: easier setup |
| **Error Tracking** | Sentry | Bugsnag | Industry standard; generous free tier |
| **Uptime Monitoring** | Better Uptime or UptimeRobot | Pingdom | Free tier sufficient for MVP |
| **APM** | Sentry Performance or Datadog (if budget) | New Relic | Sentry: bundled with error tracking |

**GDPR Note:** Self-hosted PostHog recommended for full GDPR compliance without cookie consent complexity.

### 7.2.5 Maps & Location

| Service | Recommendation | Alternative | Rationale |
|---------|----------------|-------------|-----------|
| **Maps SDK** | Mapbox | Google Maps | More affordable at scale; better DX |
| **Geocoding** | Mapbox Geocoding | Nominatim (OSS) | If budget tight, Nominatim is free |

---

## 7.3 Infrastructure & Hosting

### 7.3.1 Cloud Provider

| Recommendation | Alternative | Rationale |
|----------------|-------------|-----------|
| **AWS** | GCP, Azure, Hetzner | Widest service range; EXIST familiarity; Frankfurt region |

**Budget-Conscious Alternative:**
- Hetzner Cloud for compute (significantly cheaper)
- Managed PostgreSQL: Supabase or Neon (generous free tiers)
- This can reduce infrastructure costs by 60-70%

### 7.3.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐     ┌─────────────────────────────────────┐   │
│   │   CDN       │────▶│  Static Assets (S3 + CloudFront)    │   │
│   │ (CloudFront)│     └─────────────────────────────────────┘   │
│   └──────┬──────┘                                                │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐     ┌─────────────────────────────────────┐   │
│   │   Load      │────▶│  API Servers (ECS/Fargate or EC2)   │   │
│   │  Balancer   │     │  - NestJS API                       │   │
│   │   (ALB)     │     │  - Auto-scaling (MVP Full)          │   │
│   └─────────────┘     └──────────────┬──────────────────────┘   │
│                                       │                          │
│                       ┌───────────────┼───────────────┐          │
│                       ▼               ▼               ▼          │
│               ┌───────────┐   ┌───────────┐   ┌───────────┐     │
│               │ PostgreSQL│   │   Redis   │   │    S3     │     │
│               │   (RDS)   │   │(ElastiC.) │   │ (Images)  │     │
│               └───────────┘   └───────────┘   └───────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3.3 Environment Strategy

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| **Development** | Local development | Docker Compose |
| **Staging** | Pre-production testing | Scaled-down production clone |
| **Production** | Live users | Full infrastructure |

### 7.3.4 CI/CD Pipeline

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| **Platform** | GitHub Actions | Free for public repos; good ecosystem |
| **Container Registry** | GitHub Container Registry or ECR | Integrated with CI |
| **Deployment** | AWS CDK or Terraform | Infrastructure as Code |

**Pipeline Stages:**
1. Lint & Type Check
2. Unit Tests
3. Build
4. Integration Tests
5. Security Scan (dependencies)
6. Deploy to Staging
7. E2E Tests
8. Deploy to Production (manual approval)

---

## 7.4 Development Environment

### 7.4.1 Required Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js** | Runtime | v20 LTS |
| **pnpm** | Package manager | Faster, disk-efficient vs npm |
| **Docker** | Local services | PostgreSQL, Redis |
| **Git** | Version control | - |

### 7.4.2 Recommended IDE

| IDE | Recommended Extensions |
|-----|------------------------|
| **VS Code** | ESLint, Prettier, Prisma, GitLens, Thunder Client |

### 7.4.3 Code Quality Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting |
| **Prettier** | Formatting |
| **Husky** | Git hooks (pre-commit) |
| **lint-staged** | Run linters on staged files |
| **Commitlint** | Conventional commits |

---

## 7.5 App Store Requirements

### 7.5.1 Apple App Store

| Requirement | Specification |
|-------------|---------------|
| **Developer Account** | €99/year (Apple Developer Program) |
| **Apple Sign-In** | Required if any social login is offered |
| **Privacy Nutrition Label** | Required - document all data collection |
| **App Review** | 1-3 days typical; plan for rejections |
| **Minimum iOS Version** | iOS 14+ covers 95%+ of devices |

### 7.5.2 Google Play Store

| Requirement | Specification |
|-------------|---------------|
| **Developer Account** | $25 one-time fee |
| **Data Safety Section** | Required - document all data collection |
| **Target API Level** | Must target recent Android API (currently 34) |
| **App Signing** | Google Play App Signing recommended |

### 7.5.3 Both Platforms

| Requirement | Notes |
|-------------|-------|
| **Privacy Policy URL** | Required, must be accessible |
| **Terms of Service** | Recommended |
| **Age Rating** | Complete questionnaire honestly |
| **Screenshots** | Multiple device sizes required |

---

## 7.6 Integration Constraints

### 7.6.1 Social Login

| Provider | Requirements | Notes |
|----------|--------------|-------|
| **Google** | OAuth 2.0 consent screen, verified domain | Free |
| **Apple** | Apple Developer account, domain verification | Required for iOS if any social login |
| **Instagram** | Facebook Developer account, business verification | Optional; complex approval |

### 7.6.2 Payment (Future - Phase 3)

| Consideration | Notes |
|---------------|-------|
| **Stripe** | Recommended for Sponsored Challenges payments |
| **gGmbH Status** | Verify nonprofit Stripe account eligibility |
| **In-App Purchases** | NOT recommended for SolvTerra model (B2B payments) |

---

## 7.7 Budget Constraints

### 7.7.1 Cost-Optimized Stack (MVP Basic)

Estimated monthly infrastructure cost: **€100-200/month**

| Service | Estimated Cost | Notes |
|---------|----------------|-------|
| Hetzner Cloud (2x CPX21) | €15 | API + Worker |
| Supabase (Free tier) | €0 | Database + Auth |
| Cloudflare R2 (Free tier) | €0 | Object storage (10 GB) |
| Cloudflare (Free) | €0 | CDN, DNS |
| Resend (Free tier) | €0 | 3,000 emails/month |
| Sentry (Free tier) | €0 | 5,000 errors/month |
| FCM | €0 | Push notifications |
| Domain | ~€15/year | - |
| Apple Developer | €99/year | Required |
| **Monthly Total** | ~€100-150 | |

### 7.7.2 Scaling Costs (MVP Full)

Estimated monthly infrastructure cost: **€300-500/month**

| Service | Estimated Cost | Notes |
|---------|----------------|-------|
| AWS/Hetzner (scaled) | €100-200 | More instances |
| Managed PostgreSQL | €50-100 | Supabase Pro or RDS |
| Redis (managed) | €30-50 | ElastiCache or Upstash |
| CDN + Storage | €20-50 | Based on traffic |
| Monitoring | €50 | Sentry Team or similar |
| **Monthly Total** | ~€300-500 | |

### 7.7.3 Open Source Preference

To minimize costs and vendor lock-in, prefer open-source solutions:

| Category | Open Source Choice |
|----------|--------------------|
| Database | PostgreSQL |
| Cache | Redis |
| Search | PostgreSQL FTS → MeiliSearch |
| Analytics | PostHog (self-hosted) |
| Auth | Supabase Auth (OSS) |
| Monitoring | Grafana + Prometheus |

---

## 7.8 Technical Debt Guidelines

### 7.8.1 Acceptable Technical Debt (MVP)

| Area | Acceptable Shortcut | Plan to Address |
|------|---------------------|-----------------|
| Testing | 60% coverage (not 80%) | Increase post-MVP |
| Performance | No caching layer | Add Redis in MVP Full |
| Offline | No offline support | Add in MVP Full |
| Search | Basic filters only | Add full-text later |
| Admin Panel | Minimal features | Expand as needed |

### 7.8.2 Non-Negotiable Quality

| Area | Requirement | Reason |
|------|-------------|--------|
| Security | OWASP Top 10 | User trust, legal |
| GDPR | Full compliance | Legal requirement |
| Accessibility | WCAG A minimum | Inclusivity, legal |
| Type Safety | TypeScript strict | Maintainability |
| Auth | Proper implementation | Security critical |

---

# 8. Out of Scope / Future Considerations

This chapter explicitly defines what is **NOT** included in the MVP Basic and MVP Full releases. This clarity is essential for:
- Preventing scope creep during development
- Setting realistic expectations with stakeholders
- Allowing architectural decisions that don't block future features

---

## 8.1 Explicitly Out of Scope for MVP Basic & MVP Full

### 8.1.1 Phase 3 Features (Post-MVP Full)

The following features are documented in the Business Plan but are **NOT** part of the MVP releases:

| Feature | Description | Why Deferred |
|---------|-------------|--------------|
| **Impact Wrapped** | Personalized annual impact summary (inspired by Spotify Wrapped) | Requires 1 year of data; complex visualization |
| **Sponsored Challenges** | Corporate-sponsored challenges with rewards | Requires payment integration, B2B sales process |
| **Premium Tier for NGOs** | Paid features for NGOs with advanced needs | Need to validate freemium model first |
| **Advanced Analytics Dashboard** | Detailed analytics and reporting for NGOs | Focus on core features first |
| **API for Corporate Partners** | External API for enterprise integrations | B2B enterprise features are Phase 3 |
| **Offline Mode** | Full offline functionality with sync | Complex; focus on online experience first |
| **AI Recommendations** | ML-based challenge recommendations | Requires user behavior data |
| **Chat/Messaging** | Direct messaging between users | Community Feed sufficient for MVP |

### 8.1.2 Features Explicitly NOT Planned

These features have been considered and **rejected** for the foreseeable future:

| Feature | Reason for Exclusion |
|---------|---------------------|
| **Direct Donations** | Outside core mission; legal complexity for gGmbH |
| **Volunteer Time Booking** | SolvTerra is micro-volunteering, not scheduling platform |
| **NGO Funding/Grants** | Different product; not micro-volunteering |
| **Marketplace for Services** | Would compete with volunteers; mission conflict |
| **Anonymous Participation** | Verification requires identity; trust is core |
| **Cryptocurrency Rewards** | Complexity, volatility, regulatory concerns |
| **Physical Rewards/Merchandise** | Logistics overhead; XP/badges are sufficient |

---

## 8.2 Deferred by Release

### 8.2.1 Deferred from MVP Basic to MVP Full

These features are planned for MVP Full and should **not** be implemented in MVP Basic:

| Feature | MVP Basic | MVP Full |
|---------|-----------|----------|
| **Multi-Person Challenges** | ❌ | ✅ |
| **Teams** | ❌ | ✅ |
| **Community Feed** | ❌ | ✅ |
| **Leaderboards** | ❌ | ✅ |
| **Push Notifications** | ❌ (Email only) | ✅ |
| **Offline Challenge View** | ❌ | ✅ (Read-only) |
| **Filtering/Sorting Challenges** | Basic (Category) | Advanced (Location, Duration, Skills) |
| **NGO Analytics** | Basic (Completion count) | Detailed (Demographics, Trends) |
| **Admin: Bulk Operations** | ❌ | ✅ |

### 8.2.2 Deferred from MVP Full to Year 2

These features may be added in Year 2 based on user feedback and traction:

| Feature | Rationale for Deferral |
|---------|------------------------|
| **Multi-Language Support** | German-only sufficient for German market launch |
| **Accessibility (WCAG AA)** | WCAG A for MVP; AA requires more investment |
| **Dark Mode** | Nice-to-have; not essential for core value |
| **Calendar Integration** | Complex; most challenges are spontaneous |
| **Social Media Sharing** | Can share manually; native integration deferred |
| **Achievement Unlocking Animations** | Polish feature; basic UI sufficient |
| **Personalized Onboarding** | Generic onboarding acceptable for MVP |
| **A/B Testing Infrastructure** | PostHog basic sufficient; advanced A/B later |

---

## 8.3 Technical Out of Scope

### 8.3.1 Not Building

| Component | Alternative |
|-----------|-------------|
| **Custom Auth System** | Use Supabase Auth |
| **Custom Email Service** | Use Resend |
| **Custom Push Service** | Use Firebase Cloud Messaging |
| **Custom Analytics** | Use PostHog |
| **CDN Infrastructure** | Use Cloudflare |
| **Custom Image Processing** | Use Sharp + Cloudflare |

### 8.3.2 Platform Limitations

| Platform | Scope |
|----------|-------|
| **iOS App** | ✅ In Scope |
| **Android App** | ✅ In Scope |
| **Web App (NGO Portal)** | ✅ In Scope |
| **Desktop App** | ❌ Not planned |
| **Apple Watch** | ❌ Not planned |
| **Android Wear** | ❌ Not planned |
| **Browser Extension** | ❌ Not planned |

### 8.3.3 Integration Scope

| Integration | Status |
|-------------|--------|
| **Google Sign-In** | ✅ MVP Basic |
| **Apple Sign-In** | ✅ MVP Basic |
| **Instagram Sign-In** | ⏳ MVP Full (optional) |
| **University SSO (Shibboleth)** | ❌ Out of Scope (too complex) |
| **CRM Integration (Salesforce, HubSpot)** | ❌ Phase 3 |
| **Slack/Teams Integration** | ❌ Phase 3 |
| **Zapier/Make Integration** | ❌ Phase 3 |

---

## 8.4 User Segment Scope

### 8.4.1 Target Users for MVP

| Segment | MVP Basic | MVP Full | Notes |
|---------|-----------|----------|-------|
| **Students (18-29)** | ✅ Primary | ✅ Primary | Core target |
| **Small NGOs (1-10 employees)** | ✅ Primary | ✅ Primary | Sweet Spot |
| **Medium NGOs (11-50)** | ⚠️ Possible | ✅ Supported | May need more features |
| **Large NGOs (50+)** | ❌ Not targeted | ⚠️ Limited | May work but not optimized |
| **Corporate Volunteers** | ❌ Not targeted | ⚠️ Pilot only | Explicit pilot phase |
| **Non-Students (30+)** | ❌ Not blocked but not targeted | ⚠️ Not blocked | Focus marketing on students |
| **Schools (under 18)** | ❌ Excluded | ❌ Excluded | Age verification complexity |

### 8.4.2 Geographic Scope

| Region | Status |
|--------|--------|
| **Germany** | ✅ Primary market |
| **Austria** | ⏳ Year 2 consideration |
| **Switzerland** | ⏳ Year 2 consideration |
| **EU (other)** | ❌ Not targeted |
| **Non-EU** | ❌ Not targeted |

---

## 8.5 Future Considerations for Architecture

While the following features are out of scope, the architecture should **not actively block** them:

### 8.5.1 Design for Future Extensibility

| Future Feature | Architectural Consideration |
|----------------|----------------------------|
| **Impact Wrapped** | Store sufficient historical data; timestamp all actions |
| **Multi-Language** | Use i18n-ready patterns; externalize strings |
| **Sponsored Challenges** | Challenge model should allow `sponsor_id` field (nullable) |
| **Corporate Partners** | User model should allow `organization_type` expansion |
| **Premium NGO Tier** | NGO model should allow `subscription_tier` field |
| **Payment Integration** | Don't tightly couple any feature to "free-only" assumption |
| **External API** | Design internal API as if it could be exposed (clean contracts) |

### 8.5.2 Data to Collect Now for Future Features

Even though these features are deferred, collect data that enables them:

| Future Feature | Data to Collect Now |
|----------------|---------------------|
| **Impact Wrapped** | All completions with timestamps, categories, impact metrics |
| **AI Recommendations** | User preferences, completion history, category affinity |
| **Advanced Analytics** | Event tracking via PostHog from day 1 |
| **Personalization** | Interest tags, location preferences, time preferences |

### 8.5.3 Avoid These Architectural Decisions

| Decision to Avoid | Why |
|-------------------|-----|
| **Hardcoded German text** | Prevents i18n; use constants/config |
| **Tight coupling to Supabase** | May need to switch providers |
| **Student-only user model** | Corporate users coming in Year 2 |
| **Single NGO subscription tier** | Premium tier planned |
| **No soft deletes** | GDPR requires data retention options |

---

## 8.6 Scope Change Process

If scope changes are needed during development:

### 8.6.1 Adding Features

1. **Evaluate Impact**: Time, cost, complexity
2. **Trade-off Analysis**: What gets cut if this is added?
3. **Stakeholder Approval**: Founder + Tech Lead must approve
4. **Document Decision**: Update this PRD with rationale

### 8.6.2 Cutting Features

1. **Evaluate Necessity**: Is feature truly blocking launch?
2. **User Impact**: Which personas affected?
3. **Recovery Plan**: When can feature be added back?
4. **Document Decision**: Update PRD and inform team

### 8.6.3 Scope Creep Warning Signs

- "While we're at it, let's also..."
- "Users will definitely want..."
- "It's just a small addition..."
- "Competitors have this feature..."

**Response**: Document request, defer to post-MVP backlog, continue with agreed scope.

---

# 9. Assumptions & Dependencies

This chapter documents the assumptions underlying this PRD and the external dependencies that could impact delivery. Assumptions are beliefs we hold to be true; dependencies are external factors we cannot fully control.

---

## 9.1 Business Assumptions

### 9.1.1 Funding Assumptions

| Assumption | Confidence | Impact if False | Mitigation |
|------------|------------|-----------------|------------|
| EXIST funding (€125,000) secured by Q4 2025 | High | No development resources | Bootstrap with founders; seek alternative grants |
| Founders can work full-time from Jan 2026 | High | Delayed timeline | Part-time development; extended timeline |
| Infrastructure costs stay under €500/month | Medium | Budget strain | Use free tiers aggressively; optimize costs |
| No significant legal costs in Year 1 | Medium | Budget strain | Use template contracts; defer complex legal |

### 9.1.2 Market Assumptions

| Assumption | Confidence | Impact if False | Mitigation |
|------------|------------|-----------------|------------|
| Students want to volunteer but lack time | High | No product-market fit | Validate with surveys before full build |
| NGOs struggle to engage young volunteers | High | No B2B demand | Validate with NGO interviews |
| Micro-volunteering (5-30 min) is appealing | Medium | Core concept fails | Test with pilot users early |
| Gamification drives engagement in Germany | Medium | Low retention | A/B test gamification elements |
| German NGOs will adopt digital tools | Medium | Slow NGO onboarding | Focus on digitally-savvy NGOs first |

### 9.1.3 Competitive Assumptions

| Assumption | Confidence | Impact if False | Mitigation |
|------------|------------|-----------------|------------|
| No dominant micro-volunteering platform in Germany | High | Harder market entry | Differentiate on gamification/UX |
| betterplace.org focuses on donations, not micro-tasks | High | Competitive threat | Partner or differentiate clearly |
| Large platforms won't enter this niche quickly | Medium | Resource disadvantage | Move fast; build community moat |

---

## 9.2 User Assumptions

### 9.2.1 Student Users

| Assumption | Confidence | Validation Plan |
|------------|------------|-----------------|
| Students will download a standalone app for volunteering | Medium | Test with MVP Basic pilot |
| Students prefer mobile app over web | High | Analytics comparison |
| XP/badges/levels motivate continued engagement | Medium | Track gamification metrics |
| Social features (teams, feed) increase retention | Medium | A/B test in MVP Full |
| Students will complete verification steps | Medium | Track completion funnel |
| Word-of-mouth will drive organic growth | Medium | Track referral metrics |
| Students will share achievements on social media | Low | Track share rates |

### 9.2.2 NGO Users

| Assumption | Confidence | Validation Plan |
|------------|------------|-----------------|
| NGOs can create challenges without extensive training | Medium | Usability testing |
| NGOs will review verifications within 48 hours | Medium | Track verification times |
| Small NGOs (1-10 employees) are most receptive | High | Segment adoption data |
| NGOs value quality over quantity of volunteers | High | Qualitative interviews |
| NGOs will pay for premium features (Year 2+) | Low | Validate with pricing tests |

---

## 9.3 Technical Assumptions

### 9.3.1 Third-Party Service Assumptions

| Service | Assumption | Risk Level | Fallback |
|---------|------------|------------|----------|
| **Supabase** | Free tier sufficient for MVP Basic | Low | Self-host PostgreSQL |
| **Supabase Auth** | Stable, reliable authentication | Low | Auth0, Firebase Auth |
| **Firebase Cloud Messaging** | Free tier sufficient for push | Low | OneSignal |
| **Resend** | Free tier (3,000 emails/month) sufficient | Medium | SendGrid, Postmark |
| **Cloudflare** | Free tier sufficient for CDN | Low | AWS CloudFront |
| **PostHog** | Cloud or self-hosted available | Low | Mixpanel, Amplitude |
| **Hetzner** | Affordable, reliable hosting | Low | DigitalOcean, AWS |

### 9.3.2 Technology Stack Assumptions

| Assumption | Confidence | Impact if False |
|------------|------------|-----------------|
| React Native delivers acceptable performance | High | Rewrite in native |
| Single codebase for iOS/Android is maintainable | High | Platform-specific code |
| NestJS scales to 10,000 MAU | High | Optimize or rewrite |
| PostgreSQL handles our query patterns | High | Add caching layer |
| TypeScript improves code quality | High | Team must learn TS |

### 9.3.3 Development Assumptions

| Assumption | Confidence | Impact if False |
|------------|------------|-----------------|
| Two developers can build MVP Basic in 3 months | Medium | Extended timeline or reduced scope |
| MVP Full adds 3 months of development | Medium | Prioritize features |
| Automated testing reduces bug count | High | Manual testing burden |
| CI/CD setup takes 1-2 weeks | High | Delayed releases |

---

## 9.4 Dependencies

### 9.4.1 Critical Dependencies (Blockers)

These dependencies **must** be resolved before launch:

| Dependency | Owner | Deadline | Status |
|------------|-------|----------|--------|
| **EXIST Funding Approval** | Founders | Q4 2025 | Pending |
| **Apple Developer Account** | Founders | Before App Store submission | Not started |
| **Google Play Developer Account** | Founders | Before Play Store submission | Not started |
| **gGmbH Registration** | Founders | Before revenue | Not started |
| **Privacy Policy (DSGVO compliant)** | Legal/Founders | Before launch | Not started |
| **Terms of Service** | Legal/Founders | Before launch | Not started |
| **Domain Registration** | Founders | Before development | Not started |

### 9.4.2 High-Priority Dependencies

These dependencies are important but have workarounds:

| Dependency | Impact | Workaround |
|------------|--------|------------|
| **Pilot NGOs (3-5)** | No real content for testing | Create test challenges; use founder network |
| **Test Users (50-100)** | Limited feedback | University connections; incentivize participation |
| **Logo/Branding** | Unprofessional appearance | Use placeholder; iterate later |
| **App Store Approval** | Delayed launch | Submit early; plan for rejections |

### 9.4.3 External Dependencies (Cannot Control)

| Dependency | Risk | Monitoring |
|------------|------|------------|
| **App Store Review Times** | 1-7 days unpredictable | Submit early; buffer time |
| **Third-party API Changes** | Breaking changes | Monitor changelogs; abstract integrations |
| **GDPR Regulation Changes** | Compliance updates needed | Follow legal news |
| **University Semester Calendar** | User availability varies | Plan launches around semesters |

---

## 9.5 Partnership Dependencies

### 9.5.1 NGO Partnerships

| Partner Type | Target Count | Purpose | Status |
|--------------|--------------|---------|--------|
| **Pilot NGOs** | 3-5 | Initial content, feedback | Identifying candidates |
| **Launch NGOs** | 10-15 | MVP Full launch | Not started |
| **Year 1 NGOs** | 50+ | Growth phase | Not started |

**Pilot NGO Criteria:**
- Small to medium size (1-50 employees)
- Digitally savvy / willing to try new tools
- Active volunteer programs
- Located in Germany
- Willing to provide feedback

### 9.5.2 University Partnerships

| Partner Type | Target Count | Purpose | Status |
|--------------|--------------|---------|--------|
| **Pilot Universities** | 1-2 | User acquisition, credibility | Identifying candidates |
| **Launch Universities** | 3-5 | Expand user base | Not started |

**University Partnership Value:**
- Access to student population
- Potential for course credit integration (future)
- Marketing through university channels
- Credibility for NGO acquisition

### 9.5.3 Corporate Partnerships (Year 2)

| Partner Type | Target Count | Purpose | Status |
|--------------|--------------|---------|--------|
| **Pilot Corporates** | 1-2 | Validate B2B model | Not started |

---

## 9.6 Assumption Validation Plan

### 9.6.1 Pre-Development Validation

| Assumption to Validate | Method | Timeline | Success Criteria |
|------------------------|--------|----------|------------------|
| Students want micro-volunteering | Survey (n=100+) | Before MVP | 60%+ interest |
| NGOs need volunteer engagement tools | Interviews (n=10+) | Before MVP | 70%+ express need |
| Gamification appeals to students | Concept testing | Before MVP | Positive feedback |

### 9.6.2 MVP Basic Validation

| Assumption to Validate | Method | Success Criteria |
|------------------------|--------|------------------|
| Users complete challenges | Analytics | 30%+ completion rate |
| Users return weekly | Analytics | 30%+ W1 retention |
| NGOs create challenges | Analytics | 5+ challenges per NGO |
| Verification is not friction | Funnel analysis | 80%+ verification completion |

### 9.6.3 MVP Full Validation

| Assumption to Validate | Method | Success Criteria |
|------------------------|--------|------------------|
| Social features increase retention | A/B test | +20% retention lift |
| Multi-person challenges are popular | Usage data | 30%+ of completions |
| Leaderboards drive engagement | Usage data | 50%+ view leaderboards |

---

## 9.7 Risk Register (Assumption-Based)

| Risk | Likelihood | Impact | Trigger | Response |
|------|------------|--------|---------|----------|
| **EXIST funding not approved** | Low | Critical | Rejection letter | Seek alternative funding; reduce scope |
| **No pilot NGOs found** | Low | High | No commitments by Q4 2025 | Use founder network; create demo content |
| **Students don't download app** | Medium | Critical | <100 downloads in month 1 | Increase marketing; pivot to web-first |
| **NGOs don't create challenges** | Medium | High | <2 challenges per NGO | Improve onboarding; offer templates |
| **Verification too friction-heavy** | Medium | Medium | <50% verification rate | Simplify; auto-approve low-risk |
| **Gamification doesn't motivate** | Medium | Medium | No engagement difference | Reduce gamification; focus on impact |
| **Third-party service becomes paid** | Low | Medium | Pricing change announcement | Budget for paid tier; find alternative |
| **App Store rejection** | Medium | Low | Rejection notification | Address feedback; resubmit |

---

# 10. Milestones & Release Plan

This chapter provides a detailed roadmap for MVP Basic and MVP Full development, including milestones, deliverables, and release criteria.

---

## 10.1 High-Level Timeline

```
2025                              2026
Q4                    Q1                         Q2                         Q3+
├─────────────────────┼───────────────────────────┼───────────────────────────┼────────
│ PREPARATION         │ MVP BASIC                 │ MVP FULL                  │ GROWTH
│                     │                           │                           │
│ • EXIST approval    │ • Development (12 weeks)  │ • Development (12 weeks)  │ • Scale
│ • Team formation    │ • Internal testing        │ • Beta testing            │ • Iterate
│ • NGO pilots        │ • Pilot launch            │ • Public launch           │ • Expand
│ • Legal setup       │                           │                           │
└─────────────────────┴───────────────────────────┴───────────────────────────┴────────
```

---

## 10.2 Phase 0: Preparation (Q4 2025)

### 10.2.1 Milestones

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **P0-1: Funding Secured** | Oct 2025 | EXIST approval confirmed |
| **P0-2: Legal Foundation** | Nov 2025 | gGmbH registered, accounts setup |
| **P0-3: Partnerships Confirmed** | Dec 2025 | 3-5 pilot NGOs committed |
| **P0-4: Development Ready** | Dec 2025 | Tech stack finalized, repos created |

### 10.2.2 Checklist

| Task | Status | Owner |
|------|--------|-------|
| [ ] EXIST funding application submitted | Pending | Founders |
| [ ] EXIST funding approved | Pending | EXIST |
| [ ] gGmbH articles drafted | Not started | Legal |
| [ ] gGmbH registered | Not started | Founders |
| [ ] Bank account opened | Not started | Founders |
| [ ] Domain registered (solvterra.de) | Not started | Founders |
| [ ] Apple Developer account | Not started | Founders |
| [ ] Google Play Developer account | Not started | Founders |
| [ ] Git repository created | Not started | Tech Lead |
| [ ] CI/CD pipeline configured | Not started | Tech Lead |
| [ ] Development environment documented | Not started | Tech Lead |
| [ ] Pilot NGO agreements signed | Not started | Founders |
| [ ] Logo and basic branding | Not started | Design |
| [ ] Privacy Policy drafted | Not started | Legal |
| [ ] Terms of Service drafted | Not started | Legal |

---

## 10.3 Phase 1: MVP Basic (Q1 2026)

### 10.3.1 Sprint Overview

| Sprint | Duration | Focus Area |
|--------|----------|------------|
| Sprint 0 | Week 1-2 | Setup & Architecture |
| Sprint 1 | Week 3-4 | Authentication & User Management |
| Sprint 2 | Week 5-6 | Challenge Core (NGO Creation) |
| Sprint 3 | Week 7-8 | Challenge Discovery & Completion |
| Sprint 4 | Week 9-10 | Verification System |
| Sprint 5 | Week 11-12 | Gamification & Polish |

### 10.3.2 Sprint Details

#### Sprint 0: Setup & Architecture (Weeks 1-2)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Backend scaffold** | NestJS project with folder structure, linting, testing setup |
| **Mobile app scaffold** | React Native project with navigation, styling setup |
| **Web app scaffold** | Next.js project with component library |
| **Database schema v1** | Core tables: users, ngos, challenges |
| **CI/CD pipeline** | Automated tests run on PR, deploy to staging |
| **Development documentation** | README, contributing guide, architecture diagram |

#### Sprint 1: Authentication & User Management (Weeks 3-4)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Student registration** | Email + password, Google, Apple sign-in |
| **NGO registration** | Email + password with organization details |
| **Email verification** | Verification email sent, link works |
| **Profile management** | View/edit profile for both user types |
| **Password reset** | Forgot password flow functional |
| **Session management** | JWT tokens, refresh tokens, logout |

#### Sprint 2: Challenge Core - NGO Creation (Weeks 5-6)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **NGO Portal: Dashboard** | Overview of challenges, basic metrics |
| **Challenge creation form** | All fields from data model, validation |
| **Challenge editing** | Edit existing challenges |
| **Challenge status management** | Draft, published, archived states |
| **Image upload** | Challenge images stored in object storage |
| **Category/tag management** | Predefined categories, custom tags |

#### Sprint 3: Challenge Discovery & Completion (Weeks 7-8)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Challenge feed** | List of available challenges with basic filters |
| **Challenge detail view** | Full challenge info, NGO info, requirements |
| **Challenge start** | User can start a challenge |
| **Challenge completion** | User can mark challenge as completed |
| **My challenges** | View in-progress and completed challenges |
| **Basic search** | Search by title, category |

#### Sprint 4: Verification System (Weeks 9-10)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Photo verification** | Upload photo as proof |
| **Text verification** | Submit text response |
| **GPS verification** | Location check for geo-challenges |
| **NGO verification queue** | List pending verifications |
| **NGO approve/reject** | Approve or reject with feedback |
| **Auto-approval rules** | Configurable auto-approve for trusted users |

#### Sprint 5: Gamification & Polish (Weeks 11-12)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **XP system** | Earn XP on completion, show total |
| **Levels** | Level up based on XP thresholds |
| **Basic badges** | 5-10 achievement badges |
| **Profile badges display** | Show earned badges on profile |
| **Email notifications** | Verification status, level up |
| **Bug fixes** | Critical bugs from testing fixed |
| **Performance optimization** | App loads in <3s, API <500ms |

### 10.3.3 MVP Basic Release Criteria

**Go Criteria (All Required):**

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Core flows functional | 100% | Manual testing checklist |
| Critical bugs | 0 | Bug tracker |
| Test coverage | ≥60% | CI/CD report |
| Performance | <3s load | Lighthouse/manual |
| Security review | Pass | Checklist completed |
| GDPR compliance | Pass | Checklist completed |
| Pilot NGO content | ≥10 challenges | Database count |
| App Store submission | Approved | Store status |

**No-Go Criteria (Any = Delay):**

- Critical security vulnerability unresolved
- Core user flow broken (registration, challenge completion, verification)
- Data loss bug present
- GDPR compliance issue
- No pilot NGO content available

---

## 10.4 Phase 2: MVP Full (Q2 2026)

### 10.4.1 Sprint Overview

| Sprint | Duration | Focus Area |
|--------|----------|------------|
| Sprint 6 | Week 1-2 | Multi-Person Challenges |
| Sprint 7 | Week 3-4 | Teams |
| Sprint 8 | Week 5-6 | Community Feed |
| Sprint 9 | Week 7-8 | Leaderboards & Advanced Gamification |
| Sprint 10 | Week 9-10 | Push Notifications & Polish |
| Sprint 11 | Week 11-12 | Beta Testing & Launch Prep |

### 10.4.2 Sprint Details

#### Sprint 6: Multi-Person Challenges (Weeks 1-2)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Challenge type: group** | NGO can create group challenges |
| **Join group challenge** | User can join existing group challenge |
| **Group progress tracking** | Show individual and group progress |
| **Group completion** | Challenge completes when threshold met |
| **Invite to challenge** | Share link to invite others |

#### Sprint 7: Teams (Weeks 3-4)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Create team** | User can create a team |
| **Join team** | User can join via invite link |
| **Team management** | Admin can manage members |
| **Team challenges** | Challenges completable as team |
| **Team profile** | Public team page with stats |
| **Team XP** | Aggregate team XP and level |

#### Sprint 8: Community Feed (Weeks 5-6)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Activity feed** | Show recent completions, achievements |
| **Like/react** | Users can react to posts |
| **Comment** | Users can comment on posts |
| **Follow users** | Follow other users for personalized feed |
| **Privacy controls** | Control who sees your activity |
| **Moderation tools** | Admin can hide/delete posts |

#### Sprint 9: Leaderboards & Advanced Gamification (Weeks 7-8)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Global leaderboard** | Top users by XP |
| **Category leaderboards** | Top users per challenge category |
| **Team leaderboard** | Top teams by XP |
| **Weekly/monthly views** | Time-filtered leaderboards |
| **Streaks** | Track consecutive days/weeks |
| **Advanced badges** | 20+ badges with tiers |

#### Sprint 10: Push Notifications & Polish (Weeks 9-10)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Push notifications** | FCM integration for iOS/Android |
| **Notification preferences** | User controls notification types |
| **New challenge alerts** | Notify on relevant new challenges |
| **Social notifications** | Likes, comments, team activity |
| **Reminder notifications** | In-progress challenge reminders |
| **Performance optimization** | All screens <2s load |

#### Sprint 11: Beta Testing & Launch Prep (Weeks 11-12)

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **Beta program** | 100-500 beta users recruited |
| **Bug fixes** | All critical/high bugs resolved |
| **Load testing** | System handles 1,000 concurrent users |
| **Documentation** | User guides, FAQ, help center |
| **Marketing materials** | App Store assets, press kit |
| **Launch plan** | Launch checklist, rollback plan |

### 10.4.3 MVP Full Release Criteria

**Go Criteria (All Required):**

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| All MVP Basic features | Stable | Regression tests pass |
| All MVP Full features | Functional | Manual testing checklist |
| Critical bugs | 0 | Bug tracker |
| Test coverage | ≥70% | CI/CD report |
| Load test | 1,000 CCU | Load test report |
| Beta feedback | ≥80% positive | Survey results |
| NGO partners | ≥10 active | Database count |
| Challenges available | ≥50 | Database count |

**No-Go Criteria (Any = Delay):**

- Critical/high severity bug unresolved
- Load test failure (system crashes under load)
- Beta user NPS < 30
- Fewer than 5 active NGOs with content
- Security vulnerability identified

---

## 10.5 Release Checklist

### 10.5.1 Pre-Release (1 Week Before)

| Task | Owner | Status |
|------|-------|--------|
| [ ] All features tested and approved | QA | |
| [ ] All critical bugs resolved | Dev | |
| [ ] Performance benchmarks met | Dev | |
| [ ] Security review completed | Dev | |
| [ ] App Store assets prepared | Design | |
| [ ] Privacy Policy live | Legal | |
| [ ] Terms of Service live | Legal | |
| [ ] Help center/FAQ populated | Support | |
| [ ] Analytics verified working | Dev | |
| [ ] Error tracking verified | Dev | |

### 10.5.2 Release Day

| Task | Owner | Status |
|------|-------|--------|
| [ ] Database backup taken | DevOps | |
| [ ] Production deployment completed | DevOps | |
| [ ] Smoke tests passed | QA | |
| [ ] App Store submission approved | - | |
| [ ] Google Play submission approved | - | |
| [ ] Web app deployed | DevOps | |
| [ ] Monitoring dashboards active | DevOps | |
| [ ] Team on standby for issues | All | |

### 10.5.3 Post-Release (First Week)

| Task | Owner | Status |
|------|-------|--------|
| [ ] Monitor error rates (<1%) | DevOps | |
| [ ] Monitor performance (SLA met) | DevOps | |
| [ ] Respond to user feedback | Support | |
| [ ] Track key metrics daily | Product | |
| [ ] Hotfix any critical issues | Dev | |
| [ ] Retrospective meeting | Team | |

---

## 10.6 Rollback Plan

### 10.6.1 Rollback Triggers

| Severity | Condition | Action |
|----------|-----------|--------|
| **Critical** | Data loss, security breach, >50% users affected | Immediate rollback |
| **High** | Core flow broken, >20% users affected | Rollback within 1 hour |
| **Medium** | Feature broken, <20% users affected | Hotfix preferred, rollback if needed |
| **Low** | Minor issues | No rollback, fix in next release |

### 10.6.2 Rollback Procedure

1. **Decision**: Tech Lead + Product Owner approve rollback
2. **Communication**: Notify team, prepare user communication
3. **Execution**: Deploy previous stable version
4. **Verification**: Run smoke tests on rolled-back version
5. **Database**: Revert any schema changes (if applicable)
6. **Communication**: Notify users if significant
7. **Post-mortem**: Document cause and prevention

---

## 10.7 Success Metrics by Milestone

### 10.7.1 MVP Basic Success (End of Q1 2026)

| Metric | Target | Stretch |
|--------|--------|---------|
| Registered users | 200 | 500 |
| Active NGOs | 5 | 10 |
| Challenges created | 25 | 50 |
| Challenges completed | 100 | 250 |
| D7 Retention | 20% | 30% |

### 10.7.2 MVP Full Success (End of Q2 2026)

| Metric | Target | Stretch |
|--------|--------|---------|
| Monthly Active Users (MAU) | 500 | 1,000 |
| Active NGOs | 15 | 25 |
| Challenges available | 100 | 200 |
| Challenge completion rate | 25% | 35% |
| W4 Retention | 25% | 35% |
| NPS | 30 | 50 |

### 10.7.3 Year 1 Success (End of 2026)

| Metric | Target | Stretch |
|--------|--------|---------|
| Monthly Active Users (MAU) | 5,000 | 10,000 |
| Active NGOs | 50 | 100 |
| Challenges completed | 10,000 | 25,000 |
| Revenue (B2B) | €10,000 ARR | €25,000 ARR |

---

## 10.8 Version Numbering

| Version | Release | Description |
|---------|---------|-------------|
| 0.1.x | Internal | Development builds |
| 0.5.0 | Alpha | Feature complete MVP Basic |
| 0.9.0 | Beta | MVP Basic pilot release |
| 1.0.0 | Production | MVP Basic public release |
| 1.1.x | Production | MVP Basic patches/improvements |
| 1.5.0 | Beta | MVP Full beta |
| 2.0.0 | Production | MVP Full public release |

---

## 10.9 Communication Plan

### 10.9.1 Internal Communication

| Event | Channel | Audience |
|-------|---------|----------|
| Sprint planning | Meeting | Dev team |
| Daily standup | Async (Slack) | Dev team |
| Sprint review | Meeting | All stakeholders |
| Release decision | Meeting | Tech Lead + Founders |
| Incident | Slack alert | Dev team |

### 10.9.2 External Communication

| Event | Channel | Message |
|-------|---------|---------|
| MVP Basic launch | Email, Social | Launch announcement |
| MVP Full launch | Email, Social, Press | Major launch |
| Downtime (planned) | In-app, Email | Advance notice |
| Downtime (unplanned) | Status page, Social | Real-time updates |
| Major updates | Email, In-app | Feature announcements |

---

# Document Information

| Field | Value |
|-------|-------|
| **Document Title** | SolvTerra Product Requirements Document |
| **Version** | 1.0 |
| **Last Updated** | December 2024 |
| **Author** | Product Team |
| **Status** | Draft |
| **Scope** | MVP Basic + MVP Full |
| **Target Audience** | Development Team, Stakeholders |

---

# Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Challenge** | A micro-volunteering task created by an NGO |
| **Verification** | Proof submitted by user that challenge was completed |
| **XP** | Experience points earned by completing challenges |
| **Badge** | Achievement unlocked for specific accomplishments |
| **Streak** | Consecutive days/weeks of activity |
| **MAU** | Monthly Active Users |
| **DAU** | Daily Active Users |
| **NGO** | Non-Governmental Organization |
| **gGmbH** | Gemeinnützige GmbH (German nonprofit company) |
| **EXIST** | German government startup funding program |

---

# Appendix B: Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Business Plan | `/docs/Businessplan-Phase1-SolvTerra-EN.md` | Strategy and context |
| This PRD | `/docs/PRD-SolvTerra.md` | Product requirements |
| Technical Architecture | TBD | System design |
| API Documentation | TBD | API reference |
| Design System | TBD | UI/UX guidelines |

---

*End of Document*
