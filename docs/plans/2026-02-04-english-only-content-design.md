# English-Only Content Migration Design

**Date:** 2026-02-04
**Status:** Approved
**Goal:** Simplify the bilingual content system to English-only for challenges, badges, and organizations.

## Problem

Currently, every challenge has two language versions (`title`/`title_en`, `description`/`description_en`). When NGOs edit challenges in the web dashboard, they only edit one language, creating inconsistencies. The system complexity adds maintenance burden without clear benefit.

## Decision

- **Content language:** English only (challenges, badges, organization descriptions)
- **UI language:** Keep German/English options via i18n (buttons, labels, navigation)
- **Presentation:** International audience requires English content

## Scope

### Database Tables Affected

| Table | Columns to Remove |
|-------|-------------------|
| `challenges` | `title_en`, `description_en`, `instructions_en` |
| `badges` | `name_en`, `description_en` |

Note: `organizations` table has no `_en` columns (only in TypeScript types/mock data).

### Migration Strategy

1. Copy English values to base columns: `UPDATE challenges SET title = title_en WHERE title_en IS NOT NULL`
2. Apply same pattern for `description`, `instructions`
3. Same for `badges` table
4. Drop `_en` columns after verification

### Mobile App Changes

**Delete:**
- `apps/mobile/services/translationService.ts`
- `apps/mobile/hooks/useTranslatedContent.ts`

**Modify:**
- All components using `useTranslatedChallenge()`, `useTranslatedOrganization()`, etc. - display content directly
- `packages/shared/src/types/index.ts` - remove all `*_en` optional fields

**Keep:**
- i18next for UI translations (German/English buttons, labels)
- `languageStore` for UI preference
- Language picker in settings

### Web Dashboard Changes

**Modify:**
- `apps/web-dashboard/store/challengeStore.ts` - remove `_en` field mappings
- `apps/web-dashboard/lib/utils.ts` - remove translation utilities if present

**No changes needed:**
- Challenge form (already single-language input)

### Shared Package Changes

**Modify:**
- `packages/shared/src/types/index.ts` - remove `*_en` fields from all interfaces
- `packages/shared/src/mock-data/*.ts` - remove `*_en` fields, keep English values in base fields

## Implementation Order

1. **Database migration** - Migrate data, drop columns
2. **Shared package** - Update types and mock data
3. **Web dashboard** - Update store mappers
4. **Mobile app** - Delete translation services, update components
5. **Verification** - Type-check, test both apps

## Out of Scope

- Removing i18n from mobile app (UI translations remain)
- Changing web dashboard language support
- Automatic translation features

## Risks

- **Low:** All challenges and badges already have English translations in database
- **Medium:** Components referencing `*_en` fields will get TypeScript errors until updated
