<p align="center">
  <img src="docs/SolvTerra_logo.png" alt="SolvTerra Logo" width="200"/>
</p>

<h1 align="center">SolvTerra</h1>

<p align="center">
  <strong>Micro-Volunteering for Students</strong><br/>
  Make a measurable impact in just 5-30 minutes
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## The Problem

**54% of students want to volunteer but don't** — traditional volunteering requires commitments that don't fit student lifestyles. Meanwhile, NGOs have countless small tasks (5-30 min) that remain undone because they're too brief to coordinate through traditional channels.

## The Solution

SolvTerra is a **two-sided marketplace** connecting NGOs with students through bite-sized, meaningful tasks called "micro-challenges":

| For NGOs | For Students |
|----------|--------------|
| Post small, defined tasks | Discover challenges that fit your schedule |
| Access motivated volunteers | Complete meaningful tasks in 5-30 minutes |
| Get verified completion reports | Earn XP, badges, and build your CV |
| Document impact for funders | Join a community of change-makers |

## Features

### Mobile App (Students)
- Challenge discovery with category filters
- Photo & text verification system
- XP progression & badge collection
- Community feed & social features
- Team challenges with matchmaking

### Web Dashboard (NGOs)
- Challenge creation with templates
- Submission review queue
- Analytics & impact reporting
- Community post management
- Organization settings

## Quick Start

```bash
# Prerequisites: Node.js >= 20, pnpm >= 8

# Clone and install
git clone https://github.com/your-org/solvterra.git
cd solvterra
pnpm install

# Run Mobile App (Expo)
pnpm dev:mobile

# Run Web Dashboard (Next.js)
pnpm dev:web  # http://localhost:3000
```

## Project Structure

```
solvterra/
├── apps/
│   ├── mobile/           # Expo/React Native student app
│   └── web-dashboard/    # Next.js NGO dashboard
├── packages/
│   └── shared/           # Shared types, constants, mock data
└── docs/                 # Business plan, PRD, research
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Expo SDK 50+, React Native Paper, Zustand |
| **Web** | Next.js 14, shadcn/ui, Tailwind CSS, Recharts |
| **Shared** | TypeScript, pnpm workspaces |

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD-SolvTerra.md) | Product Requirements Document |
| [Business Plan (EN)](docs/Businessplan-Phase1-SolvTerra-EN.md) | Phase 1 business plan |
| [Business Plan (DE)](docs/Businessplan-Phase1-SolvTerra-DE.md) | German version |
| [Demo Apps](apps/README.md) | Running the demo applications |

## Demo

Both applications include realistic mock data for demonstration:

- **Student Journey**: Max Mustermann discovers and completes a food bank challenge
- **NGO Journey**: Tafel Rhein-Main e.V. reviews submissions and manages challenges

Use "Demo-Modus" in the mobile app for quick access to a pre-populated account.

## Vision & Goals

> *"A world where every person can make a measurable contribution to society with just 5 minutes of their time."*

**Year 1 (2026):** 25+ NGO partners, 2,000+ students, 10,000+ completed challenges

**Year 3 (2028):** 100+ NGOs, 10,000+ students, market leadership in Germany

**Year 5 (2030):** DACH expansion, 500+ NGOs, 50,000+ users

## Contributing

This project is currently in development for a startup competition. Contributions are welcome after the initial launch phase.

## License

Proprietary - All rights reserved.

---

<p align="center">
  <sub>Built with purpose in Frankfurt am Main, Germany</sub>
</p>
