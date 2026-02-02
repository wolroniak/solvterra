# SolvTerra Pitch Presentation Plan

## Overview
- **Event:** Shark Tank-style pitch to jury/investors
- **Duration:** 15 minutes
- **Team:** Ron (Introduction + MVP Demo), Nico, Stefi, Chuong, Yiwen, Jenny, Salma, Chaimae

---

## Presentation Structure

### Introduction (Ron)
- Mini pitch
- Mini recap
- Mini timeline
- Vision statement

### Part 1: MVP Demo (Ron)
- Act 1: Pain points of NGOs and students
- End-to-end workflow demonstration
- Live audience interaction demo

### Part 2: Financial Plan & Packages (Chuong, Yiwen, Jenny)
- Act 2: Corporate angle
- Package offerings
- Financial breakdown (costs, revenue model, break-even)

### Part 3: Roadmap & Pilot (Nico, Stefi)
- Future roadmap
- Pilot phase as Proof of Concept

---

## Key Messages from Business Plan

### Vision Statement
> "A world where every person can make a measurable contribution to society with just 5 minutes of their time."

### The Problem (Pain Points)
- **Students**: 70% have refrained from volunteering due to excessive time requirements
- **NGOs**: 10% volunteer "no-show" rate, struggle to reach younger generations, low digitalization
- **Companies**: 40% want positive public image but lack low-threshold, credible ways to execute

### The Solution
- Micro-volunteering: Tasks in 5-30 minutes
- Multi-sided platform: Students + NGOs + Corporate Sponsors
- Gamification: 54% of students more engaged with visible rewards
- Social features: 56% would volunteer more with friends

### Market Size
- **TAM**: 2.9M German university students + 600,000 NGOs
- **Market potential**: €20-60 billion annually
- **Initial target**: 1,000 NGOs + 50,000 students (Darmstadt/Hessen focus)

### Financial Highlights
- **NGO Premium**: €25/month
- **Corporate Sponsor Package**: €1,500-3,000 per mission
- **Break-even**: Month 8 of operations
- **Profit 2029**: €4.4M after taxes
- **Initial funding needed**: €150,000 grant

### Competitive Advantage (USP)
1. Micro-Volunteering (5-30 min) - Low commitment, high flexibility
2. Gamification - XP, badges, levels
3. Verification System - Proof of real impact
4. Impact Dashboard - Visible, trackable contributions
5. Mobile-First App - Where Gen Z lives
6. Sponsored Challenges - Corporate partnership model

---

## Database Current State (Live Data)

### Organizations (8 total)
| Name | Category | Verified |
|------|----------|----------|
| NABU Ortsgruppe Darmstadt | Environment | Yes |
| Tafel Rhein-Main e.V. | Social | Yes |
| Bildungsinitiative Frankfurt | Education | Yes |
| Tierheim Darmstadt e.V. | Animals | Yes |
| Deutsches Rotes Kreuz Hessen | Health | Yes |
| Kulturbrücke Mainz | Culture | Yes |
| Seniorenhilfe Rhein-Main e.V. | Social | No |
| Neue NGO (Test) | Education | Yes |

### Active Challenges (14 active, 1 draft)
- Environment: Trash collection, Conservation post sharing, Nesting boxes (team)
- Social: Food sorting, Social media sharing, Flyer distribution
- Education: Learning materials research, Explainer video creation
- Animals: Pet profile writing, Dog walking
- Health: First aid quiz, Blood donation support
- Culture: Language cafe, Recipe sharing

### Challenge Duration & XP Distribution
| Duration | Base XP | Team Bonus (1.5x) |
|----------|---------|-------------------|
| 5 min | 10 XP | 15 XP |
| 10 min | 20 XP | 30 XP |
| 15 min | 30 XP | 45 XP |
| 30 min | 50 XP | 75 XP |

---

## Codebase Analysis

### Mobile App Features (Expo/React Native)

The mobile app is a **production-grade micro-volunteering platform** with comprehensive features:

**User Journey:**
- Beautiful 4-step onboarding with animated welcome screen, sign-up (email + Google auth), interest selection (6 color-coded categories), and tutorial
- Language toggle (DE/EN) persisted with AsyncStorage

**Challenge Discovery:**
- Real-time FlatList with search and advanced filters (category, type, team mode, duration)
- Challenge cards showing: title, org with verification badge, hero image, category chip, duration/XP badges, spot availability
- Pull-to-refresh and real-time Supabase sync

**Challenge Details:**
- Rich content: hero image, description, instructions, "When & Where" timeline with urgency indicators (red if <3 days)
- Location card with Google Maps integration for on-site challenges
- Contact card with email/phone buttons and preferred contact method
- Team challenges: matchmaking section showing other seekers, friend invites, team status tracking

**Gamification:**
- XP & Levels (Starter → Legend), 12 badges across 4 categories (milestone, category, special, streak)
- Badges collection screen with progress tracking and unlock conditions
- Community feed (Instagram-style) with posts, likes, comments, activity cards

**Real-Time Features:**
- Supabase Realtime for challenge updates, submission status, notifications
- Instant approval alerts with option to share success to community

### Web Dashboard Features (Next.js 14)

The NGO dashboard is an **enterprise-grade administration platform**:

**Dashboard Home:**
- 4 KPI cards (active challenges, participants, pending reviews, volunteer hours)
- Weekly activity chart (Recharts), pending submissions panel, active challenges list
- Community activity feed, approval rate gauge, quick actions

**Challenge Management:**
- **Template system**: 4 pre-built templates (Social Media, Research, Cleanup, Team Event) for quick creation
- **Comprehensive form**: Basic info, settings (category, type, duration with auto XP calc), location, schedule (anytime/fixed/range/recurring), contact, team options, tags
- **Live preview panel** showing challenge card as NGO types
- Challenge list with tabs (All/Active/Draft/Paused), search, and action buttons

**Submission Review:**
- Split-view interface (list + detail panel)
- Photo/text proof display with star rating system (1-5)
- Challenge context always visible, quick approve/reject with feedback
- XP reward visualization and timeline

**Statistics & Analytics:**
- Multiple chart types: monthly trends, category distribution, submission status pie chart, duration distribution
- Top performing challenges ranking

**Additional Features:**
- Community post management (pin, highlight, edit, delete)
- Support ticketing with appeal workflow
- Organization settings with verification status
- Real-time notifications with unread badges

---

## Alternative Demo Features (If Time Permits)

Beyond the main "Animal Lovers" demo, these features could impress investors:

**Mobile App Highlights:**
1. **Team Challenge Flow** - Show friend invites, team formation UI, matchmaking seekers
2. **Badges Collection** - Tap to reveal earned vs. locked badges with progress bars
3. **Timeline View** - My Challenges with urgency indicators (green/yellow/red dots)
4. **Real-time Notification** - Show the instant alert when submission is approved
5. **Community Feed** - Instagram-style posts with likes/comments, activity cards
6. **Profile Gamification** - XP progress bar, level badge, stats grid
7. **Language Toggle** - Switch DE ↔ EN instantly to show i18n support

**Web Dashboard Highlights:**
1. **Challenge Creation with Template** - Show 3-minute challenge creation flow
2. **Statistics Page** - Professional Recharts visualizations (TAM validation)
3. **Verification Workflow** - Show that unverified NGOs can't publish (compliance)
4. **Community Moderation** - Pin/highlight posts, manage NGO presence

**Demo Talking Points:**
- "This isn't a prototype - it's production-ready"
- "Every feature you see works with real data"
- "Built for scale: Supabase handles millions of users"

---

## Pitch Best Practices Research Summary

### Key Statistics to Remember
- Stories are **22x more memorable** than facts alone (Harvard Business Review)
- Interactive pitches improve retention by **up to 20%** (Harvard Business School)
- The **10/20/30 Rule**: 10 slides, 20 minutes max, 30-point minimum font (Guy Kawasaki)

### Recommended Structure for 15 Minutes
| Section | Time | Purpose |
|---------|------|---------|
| Hook/Opening | 1 min | Compelling story or statistic |
| Problem | 2 min | Define pain point with empathy |
| Solution | 2 min | Your product as the answer |
| **Demo** | 3-5 min | Live demonstration (YOUR STRENGTH) |
| Market | 1-2 min | TAM/SAM/SOM with trends |
| Business Model | 1-2 min | How you make money |
| Traction | 1-2 min | Validation and pilot results |
| Team | 1 min | Why you can execute |
| Ask | 1 min | Funding amount and use |

### Demo Best Practices (from Research)
1. **Start with your coolest feature** - No time to build to a finish
2. **CEO should conduct demo** - Shows leader knows the product
3. **Budget max 5 minutes** - Demo within 20-min presentation
4. **Have everything ready** - Folder on desktop, equipment warmed up
5. **Avoid jargon** - Focus on end-user experience, not feature lists
6. **Always have backup** - Video/screenshots if tech fails

### Audience Engagement Techniques
- Open with a **rhetorical question** or surprising statistic
- Ask **thought-provoking questions** throughout (not just at Q&A)
- Make it **conversational** - pause for investor interjections
- **Read the room** - adjust energy, skip slides if needed
- **One main idea per slide** - bullet points sparingly

### What Winning Pitches Share (Shark Tank Research)
Successful pitches are: **credible, agreeable in tone, interactive, captivating, relevant, and entertaining**

### Critical Mistakes to Avoid
| Mistake | Why It Fails |
|---------|--------------|
| Not knowing numbers | Investors lose confidence immediately |
| Unrealistic valuations | Signals inexperience |
| Information overload | Confusion, fizzled excitement |
| Poor partner coordination | Unprofessional, confusing |
| No emotional connection | Investors invest in people |
| Product doesn't solve real problem | No market = no investment |

---

## Demo Concept: FINAL PLAN (REFINED)

### Cast & Stage Setup
| Role | Actor | Position | Device |
|------|-------|----------|--------|
| **Nico** (Student) | [Team Member Name] | Stage LEFT | Phone (mirrored to Screen 1) |
| **Steffi** (NGO Admin) | [Team Member Name] | Stage RIGHT | Laptop (projected to Screen 2) |
| **Narrator** | Ron | Center/flexible | No device |

### Two-Screen Setup
- **Screen 1 (Left)**: Nico's phone mirrored - student mobile app
- **Screen 2 (Right)**: Steffi's laptop - NGO web dashboard
- **Language**: English (app supports i18n toggle)

### Demo Challenge (CREATED IN DATABASE)
- **Organization**: Tierheim Darmstadt e.V. (Animals category)
- **Challenge ID**: `1b5f95da-901b-4fb4-8697-2ae979db8e22`
- **Challenge Title**: "Show Us the Animal Lovers Community!"
- **Duration**: 5 minutes | **XP Reward**: 10 XP
- **Verification**: Photo upload

### Why This Challenge Works
1. **Universal appeal** - Almost everyone loves animals = high participation
2. **Positive energy** - Fun, not heavy/serious
3. **Two-sided showcase** - Demonstrates both student AND NGO workflows
4. **Memorable** - Jury sees themselves on screen
5. **Authentic** - Tierheims genuinely need community engagement content

---

## REFINED DEMO SCRIPT (4-6 minutes)

### Demo Start `[0:00]`

**[TRANSITION FROM SLIDE 7 TO LIVE SCREENS]**

*Nico and Steffi move to their stage positions (Left/Right)*
*Ron remains center or moves aside*

**Ron (Narrator):** *(gestures to both presenters)*
> "You've met Nico and Steffi. Now watch them in action."

*Screens activate: Nico's phone (left), Steffi's dashboard (right)*

**Timing:** 5 seconds

---

### Scene 1: Steffi's Challenge `[0:05 - 0:25]`

**[FOCUS: Screen 2 - Steffi's Dashboard]**

*Steffi's dashboard shows the Challenge Detail page for "Show Us the Animal Lovers Community!"*

**Steffi:** *(pointing at her screen)*
> "I created this challenge for our shelter. We need photos showing that people in our community care about animals - it's for our social media campaign. 10 XP for students who help, just upload a photo. I'm waiting for submissions..."

*Steffi shows: challenge title, description, 5 min duration, 10 XP, photo verification*

**Timing:** 20 seconds | **Cumulative:** 0:25

---

### Scene 2: Nico's Starting Point `[0:25 - 0:45]`

**[FOCUS: Screen 1 - Nico's Phone]**

*Nico's phone shows his Profile tab with 0 XP*

**Nico:** *(looking at phone, then at audience)*
> "I want to make a difference, but I only have 5 minutes before my next class. Look at my profile - zero XP, no badges yet. Let's see if I can change that."

*Nico navigates from Profile → Discover tab*

**Timing:** 20 seconds | **Cumulative:** 0:45

---

### Scene 3: Finding the Challenge `[0:45 - 1:15]`

**[FOCUS: Screen 1 - Nico's Phone]**

*Nico is on the Discover tab*

**Nico:**
> "Let me filter by what I care about..."

*Nico taps filter icon → selects "Animals" category (orange) → Tierheim challenge appears*

**Nico:**
> "Oh! Steffi's challenge. Let me check it out."

*Nico taps to open Challenge Details → scrolls through showing: hero image, organization card with verification badge, description, instructions, "When & Where" (Anytime), 5 min duration, 10 XP reward*

**Nico:**
> "5 minutes, 10 XP, I just need to take a photo. Perfect."

**Timing:** 30 seconds | **Cumulative:** 1:15

---

### Scene 4: Accept Challenge `[1:15 - 1:30]`

**[FOCUS: Screen 1 - Nico's Phone]**

**Nico:**
> "I'll accept this."

*Nico taps "Accept Challenge" button → confirmation animation → challenge moves to "My Challenges" tab*

**Nico:**
> "Now I need to complete it..."

**Timing:** 15 seconds | **Cumulative:** 1:30

---

### Scene 5: Audience Engagement `[1:30 - 2:05]` ⭐ **KEY WOW MOMENT**

**[NICO puts phone down, faces audience directly]**

**Nico:** *(reading from phone, then looking up with realization)*
> "The challenge says 'show us the animal lovers community'..."
>
> *(looks at audience, pauses)*
>
> "Hmm... wait. YOU are a community! And I bet you love animals."
>
> "Let's prove it - on three, everyone who loves animals, raise your hands high!"
>
> "One... two... THREE!"

*Audience raises hands / waves / reacts*

💡 **This is THE memorable moment - jury becomes part of the demo**

**Timing:** 35 seconds | **Cumulative:** 2:05

---

### Scene 6: Capture & Submit `[2:05 - 2:35]`

**[FOCUS: Screen 1 - Nico's Phone]**

*Nico picks up phone, opens camera in submission flow*

**Nico:**
> "Perfect! Hold that energy!"

*Nico points phone at audience → takes photo → preview shows*

**Nico:** *(typing caption)*
> "Amazing community of animal lovers!"

*Nico taps Submit → upload progress → "Submitted" confirmation*

**Nico:**
> "Done. Now let's see if it worked..."

*Nico looks toward Steffi*

**Timing:** 30 seconds | **Cumulative:** 2:35

---

### Scene 7: Narrator Bridge `[2:35 - 2:45]`

**Ron (Narrator):** *(building suspense, gesturing from Nico to Steffi)*
> "The submission is traveling to Steffi's dashboard right now. Steffi, what do you see?"

**Timing:** 10 seconds | **Cumulative:** 2:45

---

### Scene 8: Steffi Receives Submission `[2:45 - 3:15]` ⭐ **WOW MOMENT**

**[FOCUS: Screen 2 - Steffi's Dashboard]**

*Steffi navigates to Submissions tab (or it's already visible)*

**Steffi:** *(genuine surprise/delight)*
> "Oh! A new submission just came in!"

*Steffi clicks on submission → review modal opens*

**Steffi:**
> "Let me see the photo..."

*Steffi clicks to maximize/expand the photo → AUDIENCE PHOTO appears large on Screen 2*

**Steffi:** *(delighted)*
> "Look at that! The whole audience is in the photo!"

💡 **Jury sees themselves on the big screen - maximum emotional impact**

*If submission doesn't appear immediately: Steffi clicks refresh button: "Let me check... there it is!"*

**Timing:** 30 seconds | **Cumulative:** 3:15

---

### Scene 9: Steffi Approves `[3:15 - 3:45]`

**[FOCUS: Screen 2 - Steffi's Dashboard]**

**Steffi:**
> "This is exactly what we needed. Let me approve this..."

*Steffi clicks 5 stars (one by one for visual effect)*

*Steffi types feedback:* "Wonderful community spirit! Thank you for helping Tierheim!"

*Steffi clicks "Approve" button*

**Steffi:**
> "Approved! Nico will get his XP now."

**Timing:** 30 seconds | **Cumulative:** 3:45

---

### Scene 10: Parallel Actions `[3:45 - 4:25]`

**[BOTH SCREENS ACTIVE - Parallel action]**

**[Screen 1 - Nico's Phone]**
*Notification pops up: "Submission Approved!"*

**Nico:**
> "I got the notification!"

*Nico sees "Share to Community" option*

**Nico:**
> "I can share this success with the community..."

*Nico taps "Share" → creates quick post: "Just helped Tierheim!" → posts*

**[Screen 2 - Steffi's Dashboard - happening simultaneously]**

*While Nico creates his post, Steffi navigates to Statistics tab*

**Steffi:** *(to audience)*
> "And here's where it gets interesting for NGOs. I can see all our impact data..."

*Steffi shows statistics briefly: participant chart, approval rate, category distribution*

**Timing:** 40 seconds | **Cumulative:** 4:25

---

### Scene 11: Before/After Reveal `[4:25 - 4:45]`

**[FOCUS: Screen 1 - Nico's Phone]**

*Nico navigates to Profile tab*

**Nico:**
> "Remember I started at zero? Look now..."

*Profile shows: 10 XP earned, progress bar toward next level*

**Nico:**
> "10 XP. My first contribution. I'm on my way to my first badge."

**Timing:** 20 seconds | **Cumulative:** 4:45

---

### Scene 12: Joint Closing `[4:45 - 5:05]` ⭐ **MEMORABLE CLOSE**

**[BOTH presenters face audience, screens visible behind them]**

**Nico:**
> "I helped in just minutes."

**Steffi:**
> "I have verified proof for my campaign."

**Nico + Steffi (together):**
> "Everyone wins."

💡 **This closing line encapsulates the two-sided marketplace value**

**Timing:** 20 seconds | **Cumulative:** 5:05

---

### ⏱️ Total Demo Time: ~5:05
*(Can extend to 6 min if audience energy is high, or tighten by skipping community post/statistics)*

---

### Coordination Protocol

| Handoff | Cue | Speaker |
|---------|-----|---------|
| Steffi → Nico | "Now I'm waiting for submissions..." | Steffi finishes, Nico begins |
| Nico → Ron | Nico taps Submit and looks at Steffi | Ron delivers bridge line |
| Ron → Steffi | "Steffi, what do you see?" | Steffi responds |
| Parallel action | Steffi: "Approved!" | Both act simultaneously |
| Joint close | Nico: "...just minutes" | Steffi picks up immediately |

### Verbal Handoff Phrases
- Nico to Steffi: *(eye contact + nod)*
- Steffi to Nico: "Nico will get his XP now." *(looks at Nico)*
- Ron bridges all major transitions

---

### Technical Backup Plan

| Issue | Solution |
|-------|----------|
| Submission doesn't appear | Steffi clicks refresh: "Let me check... there it is!" |
| Photo upload fails | Nico: "Let me try again..." (retry) or use pre-staged backup |
| Notification delayed | Nico: "The notification's coming..." (check manually) |
| Screen mirroring fails | Switch to screenshot walkthrough (backup slides ready) |
| Internet issues | Have mobile hotspot as backup |

### Pre-Demo Checklist (Two-Actor Setup)

**Nico's Setup (Phone - Screen 1):**
- [ ] Phone charged 100%
- [ ] Phone in Do Not Disturb mode
- [ ] Screen mirroring tested and working
- [ ] Logged in as demo student "Nico"
- [ ] App language set to English
- [ ] Starting position: Profile tab showing 0 XP
- [ ] Animals filter tested (challenge visible when filtered)

**Steffi's Setup (Laptop - Screen 2):**
- [ ] Dashboard open in browser
- [ ] Logged in as Tierheim Darmstadt admin
- [ ] Starting position: Challenge Detail page for "Animal Lovers" challenge
- [ ] Submissions tab bookmarked for quick navigation
- [ ] Statistics tab bookmarked for quick navigation

**Stage Setup:**
- [ ] Nico positioned stage LEFT
- [ ] Steffi positioned stage RIGHT
- [ ] Both screens visible to audience
- [ ] Ron (narrator) position clear
- [ ] Persona slide ready as demo intro

**Internet & Backup:**
- [ ] Internet connection tested on both devices
- [ ] Mobile hotspot ready as backup
- [ ] Screenshot walkthrough slides ready (backup)
- [ ] Pre-staged submission ready (backup if real-time fails)

**Rehearsal:**
- [ ] Practice handoff timing between Nico and Steffi
- [ ] Practice the "1-2-3" audience engagement
- [ ] Practice joint closing line together
- [ ] Dry run full demo at least twice

---

## Action Items

### Completed
- [x] Analyze database structure
- [x] Extract business plan highlights
- [x] DECIDE: Demo NGO and challenge concept → Tierheim "Animal Lovers"
- [x] Create demo challenge in database (ID: 1b5f95da-901b-4fb4-8697-2ae979db8e22)
- [x] Design demo script and flow
- [x] Decide technical setup → Two screens

### To Do - Ron
- [ ] Create demo student account with memorable name
- [ ] Create Tierheim admin account for web dashboard
- [ ] Test full demo flow end-to-end
- [ ] Practice audience engagement timing
- [ ] Prepare Introduction slides (see section below)
- [ ] Coordinate with team on transitions between sections

### To Do - Team
- [ ] Yiwen/Jenny: Prepare Part 2 & 3 slides
- [ ] Nico/Stefi: Prepare Act 1 pain points and pilot phase content
- [ ] Full team: Rehearsal with timing

---

## Introduction Section Content (Ron)

### Opening Hook (45-60 seconds) - PRIMARY VERSION
> "70% of students want to volunteer. 70% say they can't because of time. That's 2.9 million people in Germany stuck between intention and action.
>
> Meet Nico. 24 years old, studying at TU Darmstadt. He wants to help. But his schedule changes every week - seminars move, deadlines pile up. He can't commit to fixed slots. So Nico, like millions of others, does nothing.
>
> We saw this paradox and asked: why does helping others require such a big commitment? Why can't doing good be as easy as checking your phone?
>
> That's why we built SolvTerra."

### Opening Hook - ALTERNATIVE VERSION (backup)
> "Here's a paradox: Germany has 600,000 NGOs desperately needing help. It has 2.9 million students who want to help. And yet, 70% of students say they simply can't.
>
> Why? Because traditional volunteering demands commitment Nico can't give. Nico is 24, busy, well-intentioned, and stuck.
>
> We looked at this broken system and we asked: what if volunteering worked the way Nico's life actually works - flexible, mobile, in bite-sized moments?
>
> That question became SolvTerra. And today, we'll show you it works."

### Mini Pitch - Detailed Solution (30 seconds)
> "SolvTerra transforms how the next generation volunteers. We're a micro-volunteering platform that connects students with NGOs through bite-sized tasks of just 5 to 30 minutes. Students get recognition and build an impact portfolio. NGOs get reliable help without the administrative burden. And companies can sponsor real-world action for authentic CSR impact."

### Mini Recap - The Problem (45 seconds)
**Three pain points, three stakeholders:**

1. **Students WANT to help, but CAN'T commit**
   - 70% have avoided volunteering due to time requirements
   - Schedules change weekly - can't commit to fixed slots

2. **NGOs NEED help, but CAN'T reach young people**
   - 600,000 NGOs in Germany competing for volunteers
   - 10% no-show rate causes operational stress
   - Low digitalization, no way to engage Gen Z

3. **Companies WANT authentic CSR, but CAN'T execute**
   - 40% want positive public image
   - Traditional programs are costly and hard to measure

### Vision Statement (15 seconds)
> "Our vision: A world where every person can make a measurable contribution to society with just 5 minutes of their time."

### Mini Timeline (30 seconds)
- **Q4 2025**: Research & validation (completed)
- **Q1-Q4 2026**: Startup phase, MVP development, Darmstadt pilot
- **Q1 2027**: Market entry, app store launch
- **Q4 2027+**: Expansion, corporate partnerships at scale

### Transition to Demo
> "Now let me show you how this actually works. I'm going to complete a real challenge, right now, with your help."

---

## Pitch Best Practices (Key Principles)

### Structure for 15 Minutes
- **Hook** (1 min): Grab attention with problem or bold statement
- **Problem** (2 min): Pain points - make them feel it
- **Solution** (2 min): Your answer - keep it simple
- **Demo** (3-4 min): Show, don't tell - THIS IS YOUR STRENGTH
- **Market** (1-2 min): Size and opportunity
- **Business Model** (2 min): How you make money
- **Traction/Pilot** (1 min): What you've proven
- **Team** (30 sec): Why you can execute
- **Ask** (30 sec): What you need

### Golden Rules
1. **Tell a story** - Nico's story from the business plan is perfect
2. **Show, don't tell** - The live demo is your killer feature
3. **Make it emotional** - Animal lovers moment will be memorable
4. **Know your numbers** - 70%, 600K NGOs, €150K ask
5. **Anticipate questions** - Data privacy, scalability, competition
6. **End strong** - Leave them with the vision

### Common Mistakes to Avoid
- Don't read from slides
- Don't apologize for anything
- Don't use jargon (ESG, CSR - explain briefly)
- Don't rush the demo
- Don't forget to make eye contact with jury

---

## Notes & Decisions

### Decisions Made
1. ✅ Demo NGO: Tierheim Darmstadt e.V.
2. ✅ Challenge type: "Animal Lovers Community" photo challenge
3. ✅ Audience involvement: Wave/React on "1-2-3"
4. ✅ Technical setup: Two screens (phone + dashboard)
5. ✅ Language: English

### Open Questions
1. What is the exact "ask" at the end? (€150K grant mentioned in business plan)
2. Who handles Q&A after presentation?

---

## Q&A Preparation: Anticipated Tough Questions

### Category 1: Competition

**Q: "Why won't Betterplace or existing platforms just copy you?"**
> "Great question. The incumbents are optimized for donations and long-term volunteering - that's their core business. Micro-volunteering requires a fundamentally different tech stack: mobile-first, gamification engine, real-time verification, photo uploads. More importantly, they'd cannibalize their existing model. We're building for Gen Z from scratch, not retrofitting a donation platform."

**Q: "What's your competitive moat?"**
> "Three things: First, verified behavioral data - every completed challenge builds a dataset that's hard to replicate. Second, network effects - as we grow in Darmstadt, we become THE platform for student volunteering there. Third, university partnerships and NGO relationships built during our pilot create switching costs."

---

### Category 2: Business Model & Revenue

**Q: "How do you actually make money?"**
> "Two revenue streams: NGO Premium subscriptions at €25/month for organizations wanting advanced features, and Corporate Sponsor Packages at €1,500-3,000 per sponsored challenge. Students use the platform for free - they're the value creators. Our financial model shows break-even by month 8 of operations."

**Q: "Isn't €25/month too cheap to build a business?"**
> "€25/month is validated through NGO interviews - it's what they can afford. But that's not our primary revenue driver. Corporate sponsorships are. One corporate package at €2,250 equals 90 NGO premium subscriptions. We're building NGO volume to attract corporate sponsors."

**Q: "What if corporates don't pay?"**
> "Corporate CSR budgets are growing, not shrinking. ESG reporting is now mandatory for many companies. They need credible, measurable social impact. Our survey shows 40% of companies want positive public image - we give them verified proof of real-world action, not just a donation receipt."

---

### Category 3: Scalability

**Q: "How do you scale beyond Darmstadt?"**
> "City-by-city replication. Once we prove the model in Darmstadt, we have a playbook: partner with local NGOs, activate student ambassadors at universities, onboard 8-15 organizations. Our digital-first model means marginal cost per new city is near zero - it's primarily marketing and partnership effort."

**Q: "What happens when you have 100,000 users?"**
> "Our architecture is built for scale. Supabase (our backend) handles millions of users. The bigger question is supply - enough challenges to keep users engaged. That's why we're NGO-first: we onboard organizations before scaling user acquisition. Supply drives demand."

---

### Category 4: Data Privacy & Legal

**Q: "What about GDPR? Photos of people?"**
> "Three safeguards: First, challenges that require photos of people are framed as public awareness campaigns where subjects consent by participation. Second, students control their own data - they can delete submissions anytime. Third, our Row Level Security ensures users only see their own data. We're GDPR-compliant by design."

**Q: "Who owns the photos?"**
> "Students own their submissions. NGOs have license to use approved photos for their stated purpose (e.g., social media campaign). It's clearly stated in our terms. No surprises."

---

### Category 5: Verification & Trust

**Q: "How do you prevent cheating? Fake submissions?"**
> "Multi-layer verification: Photo submissions include metadata (timestamp, location). NGOs manually approve high-risk submissions. Our planned AI verification will detect obvious fakes. And gamification actually helps - users build reputation over time. A cheater gets caught eventually and loses their entire impact portfolio."

**Q: "Why would NGOs trust student submissions?"**
> "They approve every submission before XP is awarded. The NGO is always in control. Our pilot interviews showed NGOs actually appreciate this - it's less work than managing volunteers in person, and they get documented proof."

---

### Category 6: Team & Execution

**Q: "Why should we trust a student team to execute this?"**
> "We're not just students - we're 8 interdisciplinary master's students with real-world experience. Ron built the entire platform. We have expertise in AI, marketing, partnerships, and finance. Most importantly, we ARE our target user. We understand Nico because we are Nico."

**Q: "What happens after you graduate?"**
> "SolvTerra is our next step, not a side project. We're incorporating as a UG with planned transition to GmbH. Our EXIST grant application positions this as our full-time venture post-graduation."

---

### Category 7: Traction & Validation

**Q: "What proof do you have that this works?"**
> "Our research phase validated demand: 70% of students cite time as barrier, 54% want rewards, 56% want social features. Our pilot phase will validate execution. The working MVP you just saw is proof we can build. Next is proving we can activate."

**Q: "Do you have any paying customers yet?"**
> "Not yet - we're pre-revenue by design. Our pilot phase tests the workflow with real NGOs before we charge. Premature monetization would hurt our NGO onboarding. We're following the freemium playbook: build supply, prove value, then monetize."

---

### Category 8: Funding & Ask

**Q: "What are you asking for?"**
> "€150,000 in grant funding to execute our pilot phase and reach market entry. This covers 12 months of operations, platform development, and initial marketing. We're pursuing EXIST and Prototype Fund grants."

**Q: "What's your burn rate?"**
> "In 2026, projected total costs are €62,500 with founder stipends. We're lean by design - no office, no salaries yet. The majority goes to platform infrastructure and marketing."

**Q: "What if you don't get funding?"**
> "We continue building. The MVP exists. We can run a smaller pilot with university resources. Funding accelerates us, but we're not dependent on it to prove the concept."

---

### Quick Answer Cheat Sheet

| Question | Key Number/Fact |
|----------|-----------------|
| Market size | 2.9M students, 600K NGOs |
| Time barrier | 70% of students |
| Gamification impact | 54% more engaged with rewards |
| NGO no-show rate | 10% |
| NGO Premium price | €25/month |
| Corporate package | €1,500-3,000 |
| Break-even | Month 8 |
| 2029 profit | €4.4M |
| Funding ask | €150,000 |
| Team size | 8 founders |

---

### Q&A Tips

1. **Keep answers under 30 seconds** - Concise shows confidence
2. **Repeat the question** - "Great question about X..." buys thinking time
3. **Bridge to strengths** - "Yes, and that's exactly why we..."
4. **It's OK to say "We're testing that"** - Honesty about unknowns is credible
5. **End with confidence** - Don't trail off, end statements strongly

### Technical Setup Decisions
- **Demo Device**: Android phone
- **Screen Mirroring**: Use Scrcpy (USB) or wireless casting to laptop
- **Backup Plan**: Screenshot walkthrough if tech fails

---

## Slide Structure: Introduction + Demo (Ron's Sections) - FINAL

**7 slides before demo - optimized for flow and no redundancy**

---

### Slide 1: Title Slide `[0:00 - 0:05]`
**On Screen:**
```
[SolvTerra Logo - centered, large]

SOLVTERRA
Turning Intention into Action

[Team photo or names in small text at bottom]
[Date: February 2026]
```

**Visual Style:**
- Clean white/cream background (#eeebe3)
- Logo in Forest Green (#2e6417)
- Tagline in Teal (#14b8a6)

**Speaker Notes:**
- Don't say anything yet - let the slide settle
- Make eye contact with jury
- Take a breath, then begin

---

### Slide 2: The Paradox `[0:05 - 0:20]`
**On Screen:**
```
                70%                          70%
         want to volunteer            can't because of time

         ────────────────────────────────────────

              2.9 MILLION STUDENTS
              stuck between intention and action
```

**Visual Style:**
- Large bold numbers: "70%" on left and right
- Thin dividing line
- Bottom text smaller but impactful
- Dark text on light background

**Speaker Notes:**
> "70% of students want to volunteer. 70% say they can't because of time. That's 2.9 million people in Germany stuck between intention and action."

**Timing:** 15 seconds | **Cumulative:** 0:20

---

### Slide 3: Meet Nico & Steffi `[0:20 - 0:45]` ⭐ **PERSONAS INTRODUCED**
**On Screen:**
```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  [Photo of Nico Actor]       │  │  [Photo of Steffi Actor]    │
│                             │  │                             │
│  NICO                       │  │  STEFFI                     │
│  24 years old               │  │  Tierheim Darmstadt         │
│  TU Darmstadt Student       │  │  Social Media Manager       │
│  "I want to help but can't  │  │  "We need volunteers but    │
│   commit to fixed schedules"│  │   can't reach students"     │
└─────────────────────────────┘  └─────────────────────────────┘
```

**Visual Style:**
- Side-by-side persona cards with REAL photos of presenters
- Nico on LEFT (matches stage position)
- Steffi on RIGHT (matches stage position)
- Quotes show their core pain point
- Warm, approachable design

**Speaker Notes:**
> "Meet the two sides of this problem. Nico, a student who wants to help but can't commit to fixed schedules. And Steffi, who runs social media for Tierheim Darmstadt - she needs community support but can't reach busy students like Nico. They're stuck."

💡 *Using real presenter photos creates connection before demo*

**Timing:** 25 seconds | **Cumulative:** 0:45

---

### Slide 4: The Question `[0:45 - 1:00]` ⭐ **EMOTIONAL BEAT**
**On Screen:**
```


         "Why does doing good
          require such a big
          commitment?"


                                    [small SolvTerra logo]
```

**Visual Style:**
- Large centered quote in quotation marks
- Italicized or elegant font
- Small logo appearing in corner (subtle reveal)
- Clean, minimal

**Speaker Notes:**
> "Nico can't commit to 4-hour volunteer shifts. Steffi's NGO can't digitize fast enough. And companies? They want to show they care, but a press release about a charity donation doesn't move anyone. They need real stories from real people."
>
> "We asked: why does helping others require such a big commitment? Why can't doing good be as easy as checking your phone?"
>
> "That's why we built SolvTerra."

💡 *This verbal bridge introduces COMPANIES before they appear in next slide*
💡 *Pause after "SolvTerra" - let the name land*

**Timing:** 15 seconds | **Cumulative:** 1:00

---

### Slide 5: Our Solution - SolvTerra `[1:00 - 1:30]`
**On Screen:**
```
         [SolvTerra Logo]

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    STUDENTS     │  │      NGOs       │  │   COMPANIES     │
│─────────────────│  │─────────────────│  │─────────────────│
│ • 5-30 min tasks│  │ • Reliable help │  │ • Sponsor real  │
│ • Earn XP       │  │ • Zero admin    │  │   action        │
│ • Build Impact  │  │ • Reach Gen Z   │  │ • Verified      │
│   Portfolio     │  │                 │  │   impact        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Visual Style:**
- Three columns with icons
- Student icon: graduation cap or phone
- NGO icon: heart or hands
- Company icon: building or briefcase
- Each column in different brand color

**Speaker Notes:**
> "SolvTerra is a micro-volunteering platform. Students like Nico complete bite-sized tasks in 5 to 30 minutes and earn XP. NGOs like Steffi's Tierheim get reliable help, reach more people, and skip the administrative burden. And companies can sponsor challenges for authentic, verified CSR impact."

**Timing:** 30 seconds | **Cumulative:** 1:30

---

### Slide 6: Our Vision `[1:30 - 1:45]` ⭐ **KEY MESSAGE**
**On Screen:**
```




         "A world where every person
          can make a measurable contribution
          to society with just
          5 minutes of their time."




```

**Visual Style:**
- Large, centered, beautiful typography
- Cream/white background
- The "5 minutes" in gold accent (#f59e0b)
- Lots of white space - let it breathe

**Speaker Notes:**
> "Our vision: A world where every person can make a measurable contribution to society with just 5 minutes of their time."
>
> *Pause for 2 seconds - let it land*

💡 *This is the anchor statement - jury should remember this*
💡 *"5 minutes" sets up the demo where Nico literally completes a task quickly*

**Timing:** 15 seconds (including pause) | **Cumulative:** 1:45

---

### Slide 7: Demo Transition `[1:45 - 1:55]`
**On Screen:**
```




         Let us show you
         how it works.



         [Two phone/laptop icons side by side]




```

**Visual Style:**
- Clean, simple
- Two device icons hint at two-screen demo
- Could have subtle animation (text fading in)
- Builds anticipation

**Speaker Notes:**
> "Now let us show you how this actually works. Nico and Steffi are here to demonstrate - live, right now. And you might just become part of the story."
>
> *Transition to live demo screens*

💡 *"Become part of the story" teases participation without spoiling*
💡 *Presenters move to their stage positions*

**Timing:** 10 seconds | **Cumulative:** 1:55

---

### ⏱️ TIMING SUMMARY

| Section | Duration |
|---------|----------|
| Introduction Slides (1-7) | ~2:00 |
| Live Demo (Scenes 1-12) | ~5:10 |
| **Ron's Total Section** | **~7:10** |

*Note: Timeline/Roadmap slide moved to Nico/Stefi's Pilot section*

---

### [LIVE DEMO]
**Screen 1:** Phone mirrored to projector
**Screen 2:** Web dashboard open to Submissions tab

*Follow the demo script from earlier section*

**Timing:** 3-4 minutes

---

### Slide 10: Demo Recap
**On Screen:**
```

            NICO  ———🤝———  STEFFI


   ✓ 5 minutes          ✓ Real impact
   ✓ Verified proof     ✓ XP earned


      Student helped. NGO gained. Everyone wins.

```

**Visual Style:**
- Connection flow: NICO and STEFFI names with handshake icon between them
- Names in brand colors (Nico in Teal, Steffi in Forest Green)
- Handshake icon centered, slightly larger
- Four checkmarks in 2x2 grid below
- Closing tagline bold and centered
- Clean typography, no image needed - the demo WAS the visual

**Speaker Notes:**
> "That's the complete workflow. In under 5 minutes, Nico helped Steffi's NGO, earned recognition, and Steffi has verified proof for her campaign. Student helped. NGO gained. Everyone wins."
>
> *Pause, then transition to next presenter for Part 2*

**Timing:** 15-20 seconds

---

### Slide Design Summary

| Element | Specification |
|---------|---------------|
| **Primary Color** | Forest Green #2e6417 |
| **Secondary** | Teal #14b8a6 |
| **Accent** | Gold #f59e0b |
| **Background** | White or Cream #eeebe3 |
| **Font Size** | Minimum 24pt body, 36pt+ headers |
| **Font Style** | Clean sans-serif (Inter, Poppins, or similar) |
| **Slide Ratio** | 16:9 widescreen |

### Tools for Creating Slides
- **Canva** - Easy, has good templates
- **Google Slides** - Collaborative, free
- **PowerPoint** - Professional, lots of control
- **Figma** - If you want pixel-perfect design

---

## Backup Plan: Screenshot Walkthrough

Prepare these screenshots in advance (take after testing full flow):

1. **Discover Tab** - Show challenge feed with Tierheim challenge visible
2. **Challenge Detail** - Tierheim challenge with "5 min", "10 XP", description
3. **My Challenges** - After accepting, showing "In Progress" status
4. **Camera/Submit Screen** - Photo submission interface with caption field
5. **Dashboard: Submissions Queue** - NGO view with pending submission
6. **Dashboard: Review Modal** - Photo preview, star rating, feedback options
7. **Profile: XP Celebration** - After approval, showing XP earned

**Narration approach**: "Let me walk you through what the experience looks like..." and use screenshots while describing the user journey.

---

## Technical Demo Instructions: Two-Actor Setup

### Before the Presentation (Day Before)

#### 1. Nico's Mobile App Setup (Android)

**Create Demo Student Account:**
1. Open SolvTerra mobile app
2. Register with Google or email:
   - Name: **"Nico"** (keep it simple for demo)
   - Email: Use a test email you control
3. Complete onboarding:
   - Select interests: **Include "Animals"** to ensure Tierheim challenges appear
   - Complete tutorial
4. Verify account shows 0 XP in Profile

**Configure App:**
1. Go to Profile → Settings
2. Set language to **English**
3. Ensure notifications are **enabled**
4. Test that push notifications work (important for approval alert)

**Verify Challenge Access:**
1. Go to **Discover** tab
2. Filter by category: **Animals** (orange icon)
3. Verify **"Show Us the Animal Lovers Community!"** appears
4. Challenge ID: `1b5f95da-901b-4fb4-8697-2ae979db8e22`
5. Verify details: 5 min, 10 XP, Tierheim Darmstadt e.V.

#### 2. Steffi's Web Dashboard Setup

**Create Tierheim Admin Account:**
1. Go to web dashboard URL (your deployment)
2. Login or register as NGO admin
3. During registration:
   - Select organization: **Tierheim Darmstadt e.V.**
   - Complete verification if needed

**Configure Dashboard Starting State:**
1. Navigate to **Challenges** → find "Animal Lovers" challenge
2. Open Challenge Detail page
3. Bookmark this page for quick access
4. Bookmark **Submissions** tab for quick navigation
5. Bookmark **Statistics** tab for the parallel action moment

**Clear Old Test Data:**
1. If there are old submissions, delete or mark as reviewed
2. Ensure Submissions queue shows "No pending submissions" at demo start

#### 3. Test Full Flow Together

**Dry Run:**
1. Nico: Accept Tierheim challenge
2. Nico: Submit test photo
3. Steffi: Verify submission appears in dashboard
4. Steffi: Approve submission with rating + feedback
5. Nico: Verify notification received and XP updated
6. **Reset:** Delete test submission, create FRESH student account for actual demo

---

### During the Presentation: Two-Actor Flow

#### Setup (10 minutes before demo section)

**Nico's Station (Stage LEFT):**
1. Phone charged, Do Not Disturb ON
2. Connect via Scrcpy (USB) or wireless mirroring to Screen 1
3. Open SolvTerra app, logged in as "Nico"
4. Navigate to **Profile tab** (showing 0 XP)
5. Keep phone visible but not in hand until cue

**Steffi's Station (Stage RIGHT):**
1. Laptop connected to Screen 2 (projector)
2. Browser open with dashboard
3. Logged in as Tierheim admin
4. **Starting page:** Challenge Detail for "Animal Lovers"
5. Tabs ready: Submissions (bookmarked), Statistics (bookmarked)

**Ron's Position:**
1. Center stage or flexible
2. Can see both screens
3. Ready to deliver bridge narration

#### Scene-by-Scene Technical Actions

| Scene | Nico (Phone) | Steffi (Dashboard) | Ron |
|-------|-------------|-------------------|-----|
| Persona slide | Standing, phone ready | Standing, laptop ready | Introduces both |
| Scene 1 | Watch Steffi | Shows Challenge Detail, points out features | - |
| Scene 2 | Shows Profile (0 XP), navigates to Discover | Watch Nico | - |
| Scene 3 | Filter → Animals → Opens challenge details | Watch Nico | - |
| Scene 4 | Accept challenge | Watch Nico | - |
| Scene 5 | Puts phone down, faces audience, "1-2-3" | Watch and encourage audience | - |
| Scene 6 | Takes photo, adds caption, submits | Watch Nico | - |
| Scene 7 | Looks at Steffi | Ready at Submissions | Delivers bridge line |
| Scene 8 | Watch Steffi | Navigates to Submissions, opens submission, expands photo | - |
| Scene 9 | Watch Steffi | 5 stars, types feedback, approves | - |
| Scene 10 | Notification → Share to Community → posts | Navigates to Statistics, shows charts | - |
| Scene 11 | Profile → shows 10 XP | Watch Nico | - |
| Scene 12 | Delivers line | Delivers line | - |

---

### Screen Content at Each Key Moment

| Moment | Screen 1 (Nico) | Screen 2 (Steffi) |
|--------|----------------|-------------------|
| Start | Profile: 0 XP | Challenge Detail page |
| Discovery | Discover tab → Animals filter | Challenge Detail page |
| Accept | "My Challenges" with new challenge | Challenge Detail page |
| Photo | Camera/submission interface | Challenge Detail page |
| Bridge | "Submitted" confirmation | Navigating to Submissions |
| Big reveal | Submitted confirmation | AUDIENCE PHOTO maximized |
| Approval | Waiting | Review modal with 5 stars |
| Parallel | Share to Community flow | Statistics dashboard |
| Close | Profile: 10 XP | Statistics dashboard |

---

### Accounts Summary

| Account | Platform | Purpose | Credentials |
|---------|----------|---------|-------------|
| Demo Student | Mobile App | Accept & submit challenge | Create fresh for demo |
| Tierheim Admin | Web Dashboard | Review & approve submission | Link to Tierheim org |

### Challenge Details

| Field | Value |
|-------|-------|
| **Title** | Show Us the Animal Lovers Community! |
| **Title (EN)** | Show Us the Animal Lovers Community! |
| **Organization** | Tierheim Darmstadt e.V. |
| **Category** | Animals |
| **Duration** | 5 minutes |
| **XP Reward** | 10 XP |
| **Verification** | Photo upload |
| **Challenge ID** | `1b5f95da-901b-4fb4-8697-2ae979db8e22` |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Challenge not visible | Check filter settings, ensure Animals category is selected |
| Submission not appearing on dashboard | Refresh page, check internet connection |
| Photo upload fails | Check internet, try smaller photo, restart app |
| XP not updating | Force refresh profile, logout/login |
| Screen mirroring fails | Have USB cable backup, restart Scrcpy |

---

## Final Checklist: Morning of Presentation (Two-Actor Setup)

### Nico's Checklist
- [ ] Phone charged 100%
- [ ] Phone in Do Not Disturb mode
- [ ] Scrcpy installed and tested for mirroring
- [ ] Backup USB cable available
- [ ] Demo student "Nico" account logged in
- [ ] App showing Profile tab with 0 XP
- [ ] Animals filter tested - challenge visible
- [ ] Notifications enabled and working

### Steffi's Checklist
- [ ] Laptop charged / plugged in
- [ ] Dashboard open in browser
- [ ] Logged in as Tierheim Darmstadt admin
- [ ] Starting page: Challenge Detail for "Animal Lovers"
- [ ] Submissions tab bookmarked
- [ ] Statistics tab bookmarked
- [ ] Old submissions cleared / queue empty

### Stage & Technical
- [ ] Screen 1 (LEFT): Nico's phone mirroring working
- [ ] Screen 2 (RIGHT): Steffi's laptop projection working
- [ ] Internet connection tested on both devices
- [ ] Mobile hotspot ready as backup
- [ ] Backup screenshot slides saved

### Rehearsal (Do This!)
- [ ] Full dry run with Nico and Steffi together
- [ ] Practice handoffs (especially Scene 7 bridge)
- [ ] Practice "1-2-3" audience moment timing
- [ ] Practice joint closing line
- [ ] Time the full demo (target: 5 min)

### Personal
- [ ] Water available at speaking positions
- [ ] Nico and Steffi know their positions (LEFT/RIGHT)
- [ ] Ron ready for narrator bridge
- [ ] Persona slide ready as demo intro

