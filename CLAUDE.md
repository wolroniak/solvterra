# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolvTerra is a two-sided micro-volunteering marketplace connecting NGOs with students for bite-sized tasks (5-30 minutes). This is a pnpm monorepo with two frontend applications sharing types and mock data.

## Commands

```bash
# Install dependencies
pnpm install

# Run both apps in parallel
pnpm dev

# Run individual apps
pnpm dev:mobile          # Expo dev server (mobile)
pnpm dev:web             # Next.js on localhost:3000 (web dashboard)

# Build
pnpm build:web           # Production build for web dashboard

# Lint and type-check
pnpm lint                # ESLint across all packages
pnpm type-check          # TypeScript strict checking across all packages

# Mobile-specific
cd apps/mobile
pnpm android             # Run on Android
pnpm ios                 # Run on iOS

# EAS Build (mobile)
cd apps/mobile
npx eas-cli@latest build --profile development --platform android  # Dev build for testing
npx eas-cli@latest build --platform all                            # Production builds
```

## Architecture

### Monorepo Structure

- **`apps/mobile`** — Expo/React Native student app (React 19, Expo SDK 54, React Native Paper, Zustand 5)
- **`apps/web-dashboard`** — Next.js 14 NGO admin dashboard (shadcn/ui, Tailwind CSS, Recharts, Zustand 4)
- **`packages/shared`** — TypeScript-only package exporting types, constants, mock data, and badge configs

### Key Architectural Decisions

**State Management:** Zustand in both apps. Mobile uses persist middleware with AsyncStorage for language preference.

**Internationalization:** i18next in mobile app with German as default, English as fallback. Entity-level translations use `*_en` suffix fields (e.g., `title_en`, `description_en`). The `useTranslatedContent` hook resolves the correct language version. Web dashboard has no full i18n yet—uses mock data with `*_en` fields and a translation utility in `/lib/utils.ts`.

**Routing:** Expo Router (file-based) for mobile with route groups `(auth)` and `(tabs)`. Next.js App Router for web.

**UI Libraries:** React Native Paper (Material Design) for mobile; shadcn/ui (Radix primitives + Tailwind) for web.

**Data:** Supabase backend (project: `qoiujdxivwnymyftnxlc`). Edge Functions for push notifications. Mock data in `packages/shared/src/mock-data/` for development.

### Supabase

- **Project ID:** `qoiujdxivwnymyftnxlc`
- **Secrets:** Use Vault (`vault.decrypted_secrets`) not `ALTER DATABASE` (no superuser access)
- **Edge Functions:** `notify-user`, `notify-organization`, `notify-new-challenge`
- **Triggers:** 9 notification triggers read credentials from Vault

### Push Notifications

- Uses Expo Push Notifications + Supabase Edge Functions
- Requires development build (not Expo Go) to test on physical device
- Android testing is free; iOS requires Apple Developer ($99/year)
- Token registration happens on login via `userStore.ts`

### Data Models (packages/shared/src/types/)

Core entities: `User` (student), `Organization` (NGO), `Challenge` (task), `Submission` (proof of completion), `CommunityPost`. Gamification via XP system with levels (Starter→Legend) and badges.

### Design System

Brand colors defined in `apps/mobile/constants/theme.ts` and `apps/web-dashboard/tailwind.config.ts`:
- Primary (Forest Green): `#2e6417`
- Secondary (Teal): `#14b8a6`
- Accent (Gold): `#f59e0b`
- Background alt (Cream): `#eeebe3`

Category colors: environment (green), social (pink), education (purple), health (red), animals (orange), culture (cyan).

## Conventions

- **TypeScript strict mode** enabled across all packages
- **Naming:** PascalCase for components, camelCase with `use` prefix for hooks, `*Store.ts` for Zustand stores, `UPPER_SNAKE_CASE` for constants/mock data prefixed with `MOCK_`
- **Path aliases:** `@/*` maps to the app's root directory; `@solvterra/shared/*` for shared package imports in mobile
- **Styling:** `StyleSheet.create()` in mobile; Tailwind utility classes in web
- **Mock data:** All prefixed with `MOCK_` and exported from shared package for both apps to consume
- **Bilingual fields:** German is the base language; English translations stored in `*_en` suffix fields on entities

## Gotchas

- `npx eas` fails on Windows — use `npx eas-cli@latest` instead
- Font files in `app.json` plugins must exist or EAS Build fails
- ESLint not configured in apps — `pnpm lint` may fail (known issue)
