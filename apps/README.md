# SolvTerra Demo Applications

Two demonstration applications for the SolvTerra micro-volunteering platform.

## Quick Start

```bash
# From root solvterra directory
pnpm install

# Mobile App (Expo)
pnpm dev:mobile

# Web Dashboard (Next.js)
pnpm dev:web  # http://localhost:3000
```

**Prerequisites:** Node.js >= 20, pnpm >= 8

## Mobile App (Student Interface)

**Stack:** Expo SDK 50+, React Native Paper, Zustand

**Demo Access:** Tap "Demo-Modus" on welcome screen to skip onboarding.

**Features:**
- Challenge discovery with filters
- Photo/text submission with verification
- XP & badge gamification system
- User profile with progress tracking

## Web Dashboard (NGO Interface)

**Stack:** Next.js 14+, shadcn/ui, Recharts, Zustand

**Features:**
- Dashboard with key metrics
- Challenge management (CRUD)
- Submission review queue
- Community posts management
- Statistics & analytics

## Demo Data

Both apps use aligned mock data for a connected demo narrative.

| Mobile (Student) | Web Dashboard (NGO) |
|------------------|---------------------|
| Max Mustermann | Tafel Rhein-Main e.V. |
| 280 XP, Helper level | 5 challenges (4 active) |
| 12 completed challenges | 49 participants |
| 4 earned badges | 87% approval rate |

**Connected Story:** Max completes Tafel's challenge on mobile → Michael reviews it on web dashboard.

## Project Structure

```
apps/
├── mobile/              # Expo/React Native
└── web-dashboard/       # Next.js

packages/
└── shared/              # Types, constants, mock data
```

## Design System

**SolvTerra Brand Colors:**
- Primary: `#2e6417` (Forest Green)
- Secondary: `#14b8a6` (Teal)
- Accent: `#f59e0b` (Amber)

## Troubleshooting

```bash
# Mobile app issues
cd apps/mobile && npx expo start --clear

# Web dashboard issues
cd apps/web-dashboard && pnpm install && pnpm dev

# Dependency sync
pnpm install --force
```
