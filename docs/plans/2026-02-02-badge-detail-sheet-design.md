# Badge Detail Bottom Sheet - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to tap on badges in the Badge Collection screen to view detailed information in an interactive bottom sheet.

**Architecture:** Bottom sheet component using @gorhom/bottom-sheet library, triggered by tapping badge cards. Shows extended badge information including progress, earned date, XP bonus, and contextual tips.

**Tech Stack:** React Native, @gorhom/bottom-sheet, React Native Paper, i18next

---

## Feature Overview

Users can tap on any badge (earned or unearned) in the Badge Collection screen to open a bottom sheet with detailed information:

- **Earned badges:** Show badge icon with golden glow, name, category, earned date, description, XP bonus
- **Unearned badges:** Show greyed badge icon, name, category, progress bar, description, XP bonus, motivational tip

## UI Components

### BadgeDetailSheet Component

**Location:** `apps/mobile/components/BadgeDetailSheet.tsx`

**Props:**
```typescript
interface BadgeDetailSheetProps {
  badge: {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    categoryLabel: string;
    xpBonus: number;
    criteriaType: string;
    criteriaValue: Record<string, unknown>;
  } | null;
  progress: { current: number; required: number; completed: boolean } | null;
  earnedAt: string | null; // ISO date string
  visible: boolean;
  onClose: () => void;
}
```

**Visual Layout:**
```
┌─────────────────────────────────────┐
│         ═══ (Handle-Bar) ═══        │
│                                     │
│              🌱 (80px)              │
│          Badge-Icon + Glow          │
│                                     │
│         "Erste Schritte"            │
│         [Meilenstein] Chip          │
│                                     │
│   ✓ Erlangt am 02.02.2026           │
│   ────────────────────────          │
│   Schließe deine erste Challenge    │
│   erfolgreich ab und starte deine   │
│   Reise als Freiwilliger.           │
│                                     │
│         💎 +25 XP Bonus             │
│                                     │
└─────────────────────────────────────┘
```

For unearned badges:
```
│   Fortschritt: 3/5 ████░░░░ 60%     │
│   💡 Schließe noch 2 Challenges ab  │
```

### Styling

- **Earned badge icon:** Golden glow effect using `Colors.accent[100]` background with `Colors.accent[500]` border/shadow
- **Unearned badge icon:** `Colors.neutral[100]` background, icon at 30% opacity
- **Progress bar:** `Colors.accent[500]` (gold)
- **XP bonus text:** `Colors.success` (green)
- **Category chip:** Uses existing Paper `Chip` component with appropriate category color

## Dynamic Tips Logic

Tips are generated based on badge criteria type and current progress:

| Criteria Type | Tip Template (DE) | Tip Template (EN) |
|---------------|-------------------|-------------------|
| `challenge_count` | "Schließe noch {{count}} Challenge(s) ab" | "Complete {{count}} more challenge(s)" |
| `category_count` | "Schließe noch {{count}} {{category}}-Challenge(s) ab" | "Complete {{count}} more {{category}} challenge(s)" |
| `time_of_day` (before) | "Reiche eine Challenge vor {{time}} Uhr ein" | "Submit a challenge before {{time}}" |
| `time_of_day` (after) | "Reiche eine Challenge nach {{time}} Uhr ein" | "Submit a challenge after {{time}}" |
| `streak_days` | "Halte deine Serie noch {{count}} Tag(e) aufrecht" | "Maintain your streak for {{count}} more day(s)" |
| `rating_count` | "Erhalte noch {{count}} {{rating}}-Sterne-Bewertung(en)" | "Receive {{count}} more {{rating}}-star rating(s)" |

## Data Flow

1. User taps badge card in `BadgesScreen`
2. `selectedBadge` state is set with badge data
3. `BadgeDetailSheet` receives badge, progress (from `badgeProgress`), and earnedAt (from `user.badges`)
4. Sheet displays appropriate content based on earned status
5. User swipes down or taps backdrop to close
6. `onClose` clears `selectedBadge` state

## Files to Create/Modify

### New Files

1. **`apps/mobile/components/BadgeDetailSheet.tsx`**
   - Bottom sheet component with all badge detail UI
   - Tip generation logic based on criteria type
   - Animated entrance/exit

### Modified Files

2. **`apps/mobile/app/badges/index.tsx`**
   - Add `selectedBadge` state
   - Wrap badge cards in `Pressable` with `onPress`
   - Import and render `BadgeDetailSheet`
   - Pass earned date from `user.badges`

3. **`apps/mobile/i18n/locales/de/profile.json`**
   - Add `badgeDetail` section with:
     - `earnedOn`: "Erlangt am {{date}}"
     - `progress`: "Fortschritt"
     - `xpBonus`: "+{{xp}} XP Bonus"
     - `tip`: "💡 Tipp"
   - Add `badgeTips` section with all tip templates

4. **`apps/mobile/i18n/locales/en/profile.json`**
   - English translations for all new keys

### Dependencies

```bash
cd apps/mobile
pnpm add @gorhom/bottom-sheet
```

Note: `react-native-reanimated` and `react-native-gesture-handler` are already installed as Expo dependencies.

## Implementation Notes

- Use `@gorhom/bottom-sheet` with snap points at 50% screen height
- Enable backdrop tap to close
- Enable swipe to close gesture
- Badge cards should have subtle press feedback (opacity change)
- XP bonus data needs to come from `AVAILABLE_BADGES` in shared package (add `xp_bonus` to badge type)
- Earned date formatting: Use German locale format (DD.MM.YYYY)
