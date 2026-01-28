# SolvTerra — Vollständige App-Analyse & User Flows

> Stand: 28.01.2026 | Branch: multi-language

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Mobile App — User Flows](#2-mobile-app--user-flows)
3. [Web Dashboard — User Flows](#3-web-dashboard--user-flows)
4. [Supabase Schema & Datenbank](#4-supabase-schema--datenbank)
5. [Kompatibilitätsanalyse](#5-kompatibilitätsanalyse)
6. [Inkonsistenzen & Fixes](#6-inkonsistenzen--fixes)
7. [Seed-Daten Bewertung](#7-seed-daten-bewertung)

---

## 1. Projektübersicht

SolvTerra ist ein zweiseitiger Micro-Volunteering-Marktplatz, der NGOs mit Studierenden für kurze Aufgaben (5–30 Minuten) verbindet.

### Architektur

| Komponente | Technologie | Zweck |
|------------|-------------|-------|
| **Mobile App** | Expo SDK 54, React Native, React 19, Zustand 5, i18next | Studierenden-App (Challenges entdecken, bearbeiten, Community) |
| **Web Dashboard** | Next.js 14, React 19, Zustand 4, shadcn/ui, Tailwind CSS | NGO-Verwaltung (Challenges erstellen, Submissions reviewen) |
| **Shared Package** | TypeScript | Types, Konstanten, Mock-Daten |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) | Datenbank, Authentifizierung, Echtzeit-Updates |

### Datenmodell-Übersicht

```
Organizations (NGOs)
  └── Challenges (Aufgaben)
       └── Submissions (Einreichungen)
            └── Community Posts (Erfolgsberichte)
                 ├── Likes
                 └── Comments

Users (Studierende)
  ├── Submissions
  ├── Community Posts
  └── XP / Level / Badges
```

---

## 2. Mobile App — User Flows

### 2.1 Authentifizierung

**Route:** `(auth)/welcome` → `sign-up` → `interests` → `tutorial`

| Schritt | Screen | Aktion | Supabase |
|---------|--------|--------|----------|
| 1 | Welcome | Branding, Demo-Login oder "Get Started" | `auth.signInWithPassword()` (Demo) |
| 2 | Sign-Up | Email/Passwort oder Google OAuth | `auth.signUp()` / `auth.signInWithOAuth()` → `users` upsert |
| 3 | Interests | Kategorie-Auswahl (min. 1 von 6) | Nur lokal (userStore) |
| 4 | Tutorial | 3 Slides mit Feature-Erklärung | `completeOnboarding()` → Weiterleitung zu Tabs |

**Demo-Credentials:** `max.mustermann@stud.tu-darmstadt.de` / `Test1234`

---

### 2.2 Challenge Discovery (Discover Tab)

**Route:** `(tabs)/index.tsx`

**Funktionen:**
- Vertikale Challenge-Liste mit Pull-to-Refresh
- Suchfeld (Toggle im Title-Bar, Suche über Titel/Beschreibung/Organisation)
- Filter-Leiste (eine scrollbare Reihe):
  - Quick-Filter (nur ≤10 Min Challenges)
  - 6 Kategorie-Chips
  - Digital / Vor Ort
  - Einzel / Team
- Echtzeit-Updates via Supabase Channel

**Supabase:** `challenges` + `organizations` (JOIN), Channel `mobile-challenges`

**State:** `challengeStore.loadChallenges()`, `useTranslatedChallenges()`

---

### 2.3 Challenge Detail

**Route:** `challenge/[id].tsx`

**Sektionen:**
1. Hero-Bild
2. Meta-Zeile (Kategorie, Dauer, Typ)
3. Titel & Organisation
4. Beschreibung & Anleitung
5. Wann & Wo (Zeitplan, Standort, Maps-Link)
6. Kontakt (Email/Telefon)
7. Team-Challenge (Teamgröße, Matchmaking, Solo-Join)
8. Anforderungen (Verifikation, Plätze, XP)

**Aktions-Button-Logik:**

| Zustand | Button | Aktion |
|---------|--------|--------|
| Kein Submission | "Challenge annehmen" | `acceptChallenge()` → Status: `in_progress` |
| in_progress | "Einreichung hochladen" | Öffnet PhotoSubmissionModal |
| submitted | "Wird überprüft..." | Deaktiviert |
| Limit erreicht | "Limit erreicht (X/Y)" | Deaktiviert |
| Ausgebucht | "Ausgebucht" | Deaktiviert |
| Team-Challenge | "Team zusammenstellen" | Öffnet InviteFriendsModal |

**Supabase:** `submissions` INSERT, `rpc('increment_participants')`

---

### 2.4 Proof Submission & Bearbeitung

**Komponente:** `PhotoSubmissionModal.tsx`

**Ersteinreichung (Neuer Proof):**
1. Quelle wählen (Kamera / Galerie)
2. Vorschau mit optionaler Beschreibung
3. Upload → `submitProof()` → Status: `submitted`

**Bearbeitung (Edit-Modus):**
1. Pencil-Icon auf Card (Wartend/Abgelehnt Tab)
2. PhotoSubmissionModal öffnet mit vorhandenem Foto + Caption
3. Nutzer kann Foto ersetzen oder nur Caption ändern
4. "Erneut einreichen" → `updateProof()` → Status zurück auf `submitted`
5. NGO-Feedback und Rating werden gelöscht

**Supabase:** `submissions` UPDATE (proof_url, proof_text, caption, status, submitted_at)

---

### 2.5 Meine Challenges

**Route:** `(tabs)/my-challenges.tsx`

**Drei Tabs:**

| Tab | Status | Features |
|-----|--------|----------|
| **Aktiv** | `in_progress` | Timeline-Ansicht, Deadline-Urgency (Rot/Orange/Grün), Standort, Tap → Challenge Detail |
| **Wartend** | `submitted` | Status-Badge, Edit-Button (Pencil-Icon) → PhotoSubmissionModal |
| **Fertig** | `approved` / `rejected` | Approved: "Erfolg teilen" / Post bearbeiten/löschen. Rejected: NGO-Feedback (rot, kursiv) |

**Aktive Challenge Counter:** `X/5` Badge oben rechts (wird rot bei Limit)

**Edit-Button:** Runder Icon-Button mit `pencil-outline`, hellgrüner Hintergrund, rechts auf der Card für `submitted` und `rejected` Submissions.

---

### 2.6 Community Feed

**Route:** `(tabs)/community.tsx`

**Filter:** Alle | Stories | Aktivität

**Post-Typen:**

| Typ | Anzeige | Erstellt durch |
|-----|---------|----------------|
| `success_story` | CommunityPostCard (vollständig) | User nach Approval |
| `challenge_completed` | ActivityCard (kompakt) | System |
| `badge_earned` | ActivityCard | System |
| `level_up` | ActivityCard | System |
| `streak_achieved` | ActivityCard | System |

**Interaktionen:**
- Like (optimistisch + Supabase toggle)
- Kommentar (CommentSheet Modal, Fullscreen)
- Bearbeiten/Löschen (eigene Posts)
- Infinite Scroll (PAGE_SIZE = 10)
- Avatar-Tap → Nutzerprofil

**Kommentar-Vorschau:** 2 neueste Kommentare inline unter jedem Post

**Supabase:** `community_posts`, `community_likes`, `community_comments` + Channels

---

### 2.7 Profil

**Route:** `(tabs)/profile.tsx`

**Sektionen:**
1. Avatar (tappbar → Galerie → Upload zu Supabase Storage)
2. Name, Email, Level-Badge
3. XP-Fortschrittsbalken
4. Stats: Abgeschlossene Challenges, Stunden, Badges
5. Tab-Switcher: Posts-Grid | Badges
6. Einstellungen (Notifications, Account, Datenschutz, Hilfe)
7. Sprachwechsel (DE/EN Toggle, persistiert in AsyncStorage)
8. Logout

**Supabase:** `users` UPDATE (avatar), Storage `avatars`

---

### 2.8 Fremdes Nutzerprofil

**Route:** `user/[id].tsx`

**Abgespeckte Version:** Avatar, Name, Level, XP-Fortschritt, Stats (berechnet aus Submissions), Posts-Grid (tappbar → /post/[id])

**Supabase:** `users` SELECT, `submissions` COUNT + SUM(duration_minutes)

---

### 2.9 Post Detail

**Route:** `post/[id].tsx`

Vollständiger Post mit allen Interaktionen (Like, Kommentar, Edit, Delete). Lädt einzelnen Post mit Enrichment (Likes, Comments, User-Like-Status).

---

### 2.10 Echtzeit-Features

| Channel | Event | Reaktion |
|---------|-------|----------|
| `mobile-challenges` | `*` auf `challenges` | `loadChallenges()` |
| `mobile-submissions` | `UPDATE` auf `submissions` | Alert bei Approval (+XP, "Teilen?"), Alert bei Rejection |

---

### 2.11 Internationalisierung

- **i18next** mit 6 Namespaces (auth, challenges, community, common, navigation, profile)
- **Sprachen:** Deutsch (Standard), Englisch (Fallback)
- **Entity-Level:** `useTranslatedChallenge()` Hook für `title` → `title_en` etc.
- **Persistenz:** `languageStore` mit AsyncStorage

---

## 3. Web Dashboard — User Flows

### 3.1 NGO-Authentifizierung

**Route:** `/login`

| Schritt | Aktion | Supabase |
|---------|--------|----------|
| 1 | Email/Passwort eingeben | `auth.signInWithPassword()` |
| 2 | Session prüfen | `ngo_admins` → `organizations` JOIN |
| 3 | Org-Status prüfen | Verifizierungsstatus laden |
| 4 | Dashboard anzeigen | Weiterleitung zu `/` |

**Demo-Credentials:** `kontakt@tafel-rheinmain.de` / `Test1234`

---

### 3.2 Dashboard (Startseite)

**Route:** `/`

**Inhalte:**
- 4 Statistik-Karten (Aktive Challenges, Teilnehmer, Ausstehende Submissions, Volunteer-Stunden)
- Wöchentlicher Aktivitäts-Chart (Recharts BarChart)
- Ausstehende Submissions (max. 3 Vorschau)
- Aktive Challenges (max. 3 Vorschau)
- Genehmigungsrate (Kreisdiagramm)
- Quick Actions (Challenge erstellen, Submissions reviewen, Statistiken)

---

### 3.3 Challenge-Verwaltung

**Route:** `/challenges`

**Funktionen:**
- Tabellenansicht mit Suche und Tab-Filtern (Alle/Aktiv/Entwurf/Pausiert)
- Status-Badges, Teilnehmer-Fortschrittsbalken
- Aktionen pro Zeile: Ansehen, Bearbeiten, Veröffentlichen, Pausieren, Löschen

**Challenge erstellen:** `/challenges/new`
- Template-Auswahl (4 vordefinierte) oder von Grund auf
- Multi-Sektionen-Formular: Basis-Info, Einstellungen, Standort, Zeitplan, Kontakt, Team, Tags
- Live-Vorschau rechts
- XP-Berechnung: 5min→10, 10min→20, 15min→25, 30min→50 (Team: 1.5x)

**Verifizierungs-Gates:**
- `pending`: Kann Entwürfe erstellen, nicht veröffentlichen
- `verified`: Voller Zugriff
- `rejected`: Kann nichts Neues erstellen

---

### 3.4 Submission-Review

**Route:** `/submissions`

**Layout:** Liste links + Detail-Panel rechts (sticky)

**Tabs:** Eingereicht (ausstehend) | Genehmigt | Abgelehnt

**Review-Workflow:**
1. Submission aus Liste auswählen
2. Proof ansehen (Foto/Text)
3. Rating vergeben (1–5 Sterne)
4. Optional: Feedback-Text
5. "Genehmigen" oder "Ablehnen"

**Bei Genehmigung:**
- `submissions` UPDATE: status=approved, xp_earned, ngo_rating, ngo_feedback, reviewed_at
- `users` UPDATE: xp += xp_earned
- Echtzeit-Benachrichtigung an Mobile App

**Bei Ablehnung:**
- `submissions` UPDATE: status=rejected, ngo_feedback, reviewed_at
- Feedback wird auf Mobile in der Card angezeigt

---

### 3.5 Admin-Portal

**Route:** `/admin`

**Funktionen:**
- Organisations-Verifizierung (Warteschlange)
- Support-Tickets
- Platform-Statistiken
- Separater Auth-Flow (`solvterra_admins`)

**Verifizierungs-Workflow:**
```
pending → verified (verify_organization RPC)
       → rejected (reject_organization RPC, mit Grund)
```

---

### 3.6 Echtzeit-Updates (StoreProvider)

| Channel | Event | Reaktion |
|---------|-------|----------|
| `dashboard-submissions` | INSERT/UPDATE | Toast-Notification, Store-Refresh |
| `dashboard-challenges` | UPDATE | Toast bei neuen Teilnehmern |
| `org-status-{id}` | UPDATE auf `organizations` | Verifizierungs-Banner aktualisieren |

---

## 4. Supabase Schema & Datenbank

### 4.1 Tabellen-Übersicht

| Tabelle | Spalten | Zweck | RLS |
|---------|---------|-------|-----|
| `organizations` | 13 | NGO-Stammdaten + Verifizierung | Ja |
| `challenges` | 22 | Aufgaben/Challenges | Ja |
| `users` | 7 | Studierenden-Profile | **Nein** |
| `submissions` | 14 | Einreichungen/Proof | **Teilweise** |
| `ngo_admins` | 5 | NGO-User-Verknüpfung | Ja |
| `solvterra_admins` | 6 | Platform-Admin-System | Ja |
| `notifications` | 8 | NGO-Dashboard-Benachrichtigungen | Ja |
| `support_tickets` | 11 | Support & Appeals | Ja |
| `community_posts` | 12 | Social Feed Posts | Ja |
| `community_likes` | 4 | Post-Likes | Ja |
| `community_comments` | 5 | Post-Kommentare | Ja |

### 4.2 Wichtige Datenbank-Funktionen

| Funktion | Zweck |
|----------|-------|
| `register_organization()` | Org + Admin-Link erstellen |
| `verify_organization()` | Org verifizieren (Admin) |
| `reject_organization()` | Org ablehnen (Admin) |
| `is_solvterra_admin()` | Admin-Prüfung |
| `get_admin_info()` | Admin-Daten laden |
| `create_notification()` | Benachrichtigung erstellen |
| `mark_notification_read()` | Als gelesen markieren |
| `get_unread_notification_count()` | Ungelesene zählen |
| `create_support_ticket()` | Ticket erstellen |
| `respond_to_ticket()` | Ticket beantworten (Admin) |
| `get_community_total_xp()` | Community-XP summieren |

### 4.3 Trigger

| Trigger | Tabelle | Aktion |
|---------|---------|--------|
| `notify_verification_status_change` | `organizations` | Benachrichtigung bei Verifizierung/Ablehnung |
| `notify_submission_reviewed` | `submissions` | Benachrichtigung bei Approval/Rejection |
| `update_ticket_timestamp` | `support_tickets` | `updated_at` aktualisieren |

### 4.4 Storage

| Bucket | Zweck | Zugriff |
|--------|-------|---------|
| `proof-photos` | Beweis-Fotos für Submissions | Öffentlich (anon INSERT/SELECT) |
| `avatars` | Profilbilder | Öffentlich |

---

## 5. Kompatibilitätsanalyse

### Was zusammenpasst

| Bereich | Status | Details |
|---------|--------|---------|
| Tabellen-Schema | Kompatibel | Gleiche Spalten in Mobile + Web + Schema |
| Submission-Lifecycle | Kompatibel | Mobile erstellt → Web reviewed → Mobile erhält Echtzeit-Update |
| Challenge-CRUD | Kompatibel | Web erstellt → Mobile zeigt an |
| Auth-System | Kompatibel | Separate Flows (Student vs NGO) mit gleicher Supabase-Auth |
| Bilingual-Felder | Kompatibel | `*_en` durchgängig in Schema, Types, Seed, Mobile |
| Kategorien | Kompatibel | Gleiche 6+1 Kategorien überall |
| Community-System | Kompatibel | Mobile liest/schreibt, Schema unterstützt alles |

### Was getrennt läuft

| Bereich | Details |
|---------|---------|
| Community-Store (Web) | Nutzt noch Mock-Daten statt Supabase |
| i18n (Web) | Kein vollständiges i18n im Web Dashboard |
| Admin-Portal | Teilweise implementiert (Verifizierungsliste ohne Detail-View) |

---

## 6. Inkonsistenzen & Fixes

### Priorisierungsliste

| # | Priorität | Problem | Auswirkung | Betroffene Dateien | Fix |
|---|-----------|---------|------------|--------------------|----|
| 1 | **KRITISCH** | XP-Level-Grenzen stimmen nicht überein | User-Level wird in Mobile falsch berechnet. Tim (1850 XP) = "Legend" in Mobile, "Supporter" laut Shared | `apps/mobile/app/(tabs)/profile.tsx`, `apps/mobile/app/user/[id].tsx` | Mobile LEVELS an Shared `XP_LEVELS` angleichen: starter=0, helper=100, supporter=500, champion=2000, legend=5000 |
| 2 | **KRITISCH** | `increment_participants` RPC fehlt im Schema | Wird von Mobile aufgerufen aber nie definiert. Funktioniert nur wenn manuell in Supabase angelegt | Keine Migration vorhanden | Neue Migration erstellen mit `CREATE FUNCTION increment_participants(challenge_uuid UUID)` |
| 3 | **HOCH** | RLS auf `submissions` fehlt | Jeder authentifizierte User kann alle Submissions lesen/ändern | `supabase/schema.sql` | RLS aktivieren: User sehen eigene Submissions, NGOs sehen Submissions ihrer Challenges |
| 4 | **HOCH** | RLS auf `users` fehlt | Jeder kann alle User-Daten lesen/schreiben | `supabase/schema.sql` | RLS aktivieren: User können eigenes Profil ändern, alle können Profile lesen |
| 5 | **HOCH** | Storage `proof-photos` erlaubt anonyme Uploads | Sicherheitsrisiko in Production | `supabase/storage.sql` | Policy auf `authenticated` beschränken |
| 6 | **MITTEL** | Submission-Status "accepted" nie benutzt | Toter Enum-Wert, verwirrt | Schema CHECK, Shared Types | Aus CHECK-Constraint und Types entfernen oder als Alias für `in_progress` dokumentieren |
| 7 | **MITTEL** | Mock-Daten IDs ≠ Seed-Daten IDs | Mock: `challenge-1`, Seed: UUIDs. Kein funktionales Problem da Mock nicht mehr benutzt | `packages/shared/src/mock-data/` | Mock-Daten aufräumen oder als Deprecated markieren |
| 8 | **MITTEL** | Web Community Store nutzt Mock-Daten | Community-Seite im Dashboard zeigt keine echten Posts | `apps/web-dashboard/store/index.ts` | `useCommunityStore` auf Supabase umstellen |
| 9 | **NIEDRIG** | MAX_ACTIVE_CHALLENGES: 5 in Shared, aber UI-Texte zeigen teilweise "3" | Verwirrung in Demo, aber Logik nutzt korrekt den Shared-Wert | Diverse UI-Stellen | UI-Texte prüfen und vereinheitlichen |
| 10 | **NIEDRIG** | Web Dashboard hat kein vollständiges i18n | Nur deutsch, kein Sprachwechsel möglich | `apps/web-dashboard/` | i18next + Provider einrichten (wenn gewünscht) |

---

## 7. Seed-Daten Bewertung

### Organisations-Daten (7 NGOs)

| Organisation | Kategorie | Status | Bewertung |
|-------------|-----------|--------|-----------|
| NABU Ortsgruppe Darmstadt | Environment | Verified | Gut, realistische Umwelt-NGO |
| Tafel Rhein-Main e.V. | Social | Verified | Gut, bekannte Marke, Demo-NGO für Dashboard |
| Bildungsinitiative Frankfurt | Education | Verified | Gut, Bildungskontext |
| Tierheim Darmstadt e.V. | Animals | Verified | Gut, Tierschutz-Kontext |
| Deutsches Rotes Kreuz Hessen | Health | Verified | Gut, Gesundheits-Kontext |
| Kulturbrücke Mainz | Culture | Verified | Gut, Kultur-Kontext |
| Seniorenhilfe Rhein-Main e.V. | Social | **Pending** | Gut für Demo der Verifizierung |

**Ergebnis:** Alle 6 Kategorien abgedeckt, 1 pending-Org für Admin-Demo. **Keine Änderung nötig.**

### User-Daten (6 Studierende)

| User | XP | Level (Seed) | Level (Mobile) | Level (Shared) | Problem? |
|------|----|-------------|---------------|---------------|----------|
| Max Mustermann | 280 | 2 (Helper) | Helper (100-300) | Helper (100-499) | Passt |
| Lena Fischer | 520 | 3 (Supporter) | Champion (600-1000) | Supporter (500-1999) | **Mobile zeigt falsches Level** |
| Tim Weber | 1850 | 3 (Supporter) | Legend (1000-2000) | Supporter (500-1999) | **Mobile zeigt falsches Level** |
| Anna Schneider | 2450 | 4 (Champion) | > Legend (>2000) | Champion (2000-4999) | **Mobile hat kein Level dafür** |
| Jonas Hoffmann | 45 | 1 (Starter) | Starter (0-100) | Starter (0-99) | Passt |
| Marie Becker | 180 | 2 (Helper) | Helper (100-300) | Helper (100-499) | Passt |

**Ergebnis:** Nach Fix #1 (Mobile-Levels an Shared angleichen) passen alle Seed-Werte. **Level-Feld in Seed muss aktualisiert werden** (Tim: Level 3→3, Anna: Level 4→4 — stimmt bereits).

### Challenge-Daten (15 Challenges)

- Alle 6 Kategorien abgedeckt
- Mix aus Digital/Onsite, Einzel/Team
- Verschiedene Dauern (5, 10, 15, 30 Min)
- Verschiedene Verifikationsmethoden
- Bilinguale Felder (`_en`) vorhanden
- **Seed-Challenges stimmen nicht 1:1 mit Mock-Challenges überein** (andere IDs, leicht andere Inhalte), aber da Mock-Daten nicht mehr benutzt werden, ist das kein Problem.

**Ergebnis:** Seed-Daten sind gut. **Keine Änderung nötig.**

### Submission-Daten (8 Submissions)

| Status | Anzahl | Realismus |
|--------|--------|-----------|
| in_progress | 2 | Gut |
| submitted | 3 | Gut, verschiedene Proof-Typen |
| approved | 2 | Mit Ratings und Feedback |
| rejected | 1 | Mit Ablehnungsgrund |

**Ergebnis:** Gute Verteilung über alle Status. **Keine Änderung nötig.**

### Community Posts (6 Posts + Likes + Kommentare)

- 3 Success Stories mit Bildern
- 3 Activity Posts (system-generiert)
- 12 Likes verteilt
- 5 Kommentare

**Ergebnis:** Ausreichend für Demo. **Keine Änderung nötig.**

---

## Anhang: Navigationsstruktur

### Mobile App

```
app/
├── index.tsx                    → Auth-Check, Redirect
├── (auth)/
│   ├── welcome.tsx              → Onboarding Start
│   ├── sign-up.tsx              → Registrierung
│   ├── interests.tsx            → Kategorie-Auswahl
│   └── tutorial.tsx             → Feature-Tutorial
├── (tabs)/
│   ├── index.tsx                → Discover (Challenge-Feed)
│   ├── community.tsx            → Community (Social Feed)
│   ├── my-challenges.tsx        → Meine Challenges
│   └── profile.tsx              → Profil
├── challenge/[id].tsx           → Challenge-Detail
├── post/[id].tsx                → Post-Detail
├── user/[id].tsx                → Fremdes Profil
└── badges/index.tsx             → Badges-Galerie
```

### Web Dashboard

```
app/
├── page.tsx                     → Dashboard (Startseite)
├── login/page.tsx               → NGO Login
├── register/page.tsx            → NGO Registrierung
├── challenges/
│   ├── page.tsx                 → Challenge-Liste
│   ├── new/page.tsx             → Challenge erstellen
│   └── [id]/
│       ├── page.tsx             → Challenge ansehen
│       └── edit/page.tsx        → Challenge bearbeiten
├── submissions/
│   ├── page.tsx                 → Submission-Liste + Detail
│   └── [id]/page.tsx            → Submission-Detail (Vollseite)
├── community/page.tsx           → Community-Verwaltung
├── statistics/page.tsx          → Statistiken
├── settings/page.tsx            → Einstellungen
├── support/page.tsx             → Hilfe
└── admin/
    ├── login/page.tsx           → Admin Login
    ├── page.tsx                 → Admin Dashboard
    ├── verifications/page.tsx   → Org-Verifizierung
    └── tickets/page.tsx         → Support-Tickets
```
