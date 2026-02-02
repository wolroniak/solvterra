# SolvTerra — Vollständige Plattform-Dokumentation

> **Für Investoren und Förderer**
> Stand: 28.01.2026 | MVP-Version | Branch: ron

---

## Executive Summary

SolvTerra ist eine zweiseitige Micro-Volunteering-Plattform, die gemeinnützige Organisationen (NGOs) mit engagierten Studierenden verbindet. Die Plattform besteht aus:

- **Mobile App** (iOS/Android) — Studierende entdecken, absolvieren und teilen Challenges
- **Web Dashboard** — NGOs erstellen Challenges und verwalten Einreichungen
- **Backend** — Supabase (PostgreSQL, Auth, Storage, Realtime) für Echtzeit-Synchronisation

### Kernfunktionen im Überblick

| Funktion | Mobile App | Web Dashboard |
|----------|-----------|---------------|
| Authentifizierung | Email/Passwort + Google OAuth | Email/Passwort |
| Challenge-Management | Entdecken, Annehmen, Einreichen | Erstellen, Bearbeiten, Veröffentlichen |
| Submission-Review | Proof hochladen, Status verfolgen | Bewerten, Genehmigen, Ablehnen |
| Community | Posts, Likes, Kommentare | (Integration geplant) |
| Gamification | XP, Levels, Badges | Statistiken |
| Echtzeit-Updates | Benachrichtigungen bei Review | Neue Submissions |
| Mehrsprachigkeit | Deutsch + Englisch | Deutsch |

---

## Inhaltsverzeichnis

1. [Technische Architektur](#1-technische-architektur)
2. [Mobile App — Detaillierte User Flows](#2-mobile-app--detaillierte-user-flows)
3. [Web Dashboard — Detaillierte User Flows](#3-web-dashboard--detaillierte-user-flows)
4. [Supabase Backend — Schema & Funktionen](#4-supabase-backend--schema--funktionen)
5. [Sicherheit & Datenschutz](#5-sicherheit--datenschutz)
6. [Gamification-System](#6-gamification-system)
7. [Internationalisierung](#7-internationalisierung)
8. [Technische Implementierungsdetails](#8-technische-implementierungsdetails)

---

## 1. Technische Architektur

### 1.1 Monorepo-Struktur

```
solvterra/
├── apps/
│   ├── mobile/           # Expo/React Native (Studierende)
│   └── web-dashboard/    # Next.js 14 (NGOs)
├── packages/
│   └── shared/           # TypeScript Types, Konstanten, Mock-Daten
├── supabase/
│   ├── schema.sql        # Datenbank-Schema
│   ├── storage.sql       # Storage-Policies
│   └── seed.sql          # Demo-Daten
└── i18n/                 # Übersetzungen (DE/EN)
```

### 1.2 Technologie-Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| **Mobile App** | Expo SDK | 54 |
| | React Native | 0.79 |
| | React | 19 |
| | State Management | Zustand 5 |
| | UI Library | React Native Paper |
| | Navigation | Expo Router |
| | i18n | i18next |
| **Web Dashboard** | Next.js | 14 (App Router) |
| | React | 19 |
| | State Management | Zustand 4 |
| | UI Library | shadcn/ui |
| | Styling | Tailwind CSS |
| | Charts | Recharts |
| **Backend** | Supabase | PostgreSQL 15 |
| | Auth | Supabase Auth (Email + OAuth) |
| | Storage | Supabase Storage |
| | Realtime | Supabase Realtime Channels |

### 1.3 Datenmodell-Übersicht

```
┌─────────────────────┐
│   Organizations     │ ── 1:N ──┬── Challenges
│   (7 in Demo)       │          │
└─────────────────────┘          │
                                 │
┌─────────────────────┐          │
│   Users             │ ── M:N ──┴── Submissions (mit Proof)
│   (6 in Demo)       │
└─────────────────────┘
         │
         └── 1:N ── Community Posts
                          │
                          ├── Likes (M:N mit Users)
                          └── Comments (1:N)
```

---

## 2. Mobile App — Detaillierte User Flows

### 2.1 Authentifizierung

**Dateien:**
- `apps/mobile/app/(auth)/welcome.tsx` — Startbildschirm
- `apps/mobile/app/(auth)/sign-up.tsx` — Registrierung
- `apps/mobile/app/(auth)/sign-in.tsx` — Anmeldung
- `apps/mobile/app/(auth)/interests.tsx` — Interessenauswahl
- `apps/mobile/app/(auth)/tutorial.tsx` — Einführung
- `apps/mobile/store/userStore.ts` — Auth-State

#### Flow: Registrierung

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Welcome   │ → │   Sign-Up   │ → │  Interests  │ → │  Tutorial   │
│             │    │             │    │             │    │             │
│ Registrieren│    │ Email/PW    │    │ Min. 1 von  │    │ 3 Slides   │
│ Anmelden    │    │ Google OAuth│    │ 6 Kategorien│    │ mit Tipps   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   Supabase Auth:
                   - auth.signUp()
                   - users-Tabelle INSERT
```

**Registrierung (Code-Referenz: `sign-up.tsx:67-97`):**
1. Email + Passwort validieren (min. 8 Zeichen)
2. `supabase.auth.signUp()` aufrufen
3. Bei Erfolg: User-Record in `users`-Tabelle erstellen
4. Weiterleitung zu `/interests`

**Google OAuth (Code-Referenz: `userStore.ts:260-324`):**
1. OAuth-URL von Supabase abrufen
2. WebBrowser Session öffnen
3. Tokens aus Redirect-URL extrahieren
4. Session in Supabase setzen
5. User-Record mit Google-Profildaten erstellen

#### Flow: Anmeldung

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Welcome   │ → │   Sign-In   │ → │  Tabs/Home  │
│             │    │             │    │             │
│ Anmelden    │    │ Email/PW    │    │ Challenges  │
│             │    │ Google OAuth│    │ entdecken   │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   Supabase Auth:
                   - auth.signInWithPassword()
                   - users-Daten laden
```

**Session-Check bei App-Start (`userStore.ts:176-195`):**
```typescript
checkSession: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const stats = await ensureUserRecordAndFetchData(session.user);
    const user = createUserFromAuth(session.user, stats);
    set({ user, isAuthenticated: true });
  }
}
```

---

### 2.2 Challenge Discovery

**Dateien:**
- `apps/mobile/app/(tabs)/index.tsx` — Discover-Screen
- `apps/mobile/store/challengeStore.ts` — Challenge-State
- `apps/mobile/components/ChallengeCard.tsx` — Challenge-Karte

#### Hauptfunktionen

| Funktion | Beschreibung | Implementierung |
|----------|--------------|-----------------|
| **Challenge-Liste** | Vertikale FlatList mit Pull-to-Refresh | `index.tsx:42-89` |
| **Suche** | Titel, Beschreibung, Organisation durchsuchen | `index.tsx:91-125` |
| **Filter** | Kategorie, Dauer, Typ (Digital/Vor Ort) | Filter-Chips mit `setFilters()` |
| **Echtzeit-Updates** | Supabase Channel für neue Challenges | `index.tsx:127-145` |

#### Filter-Optionen

| Filter | Werte | UI-Element |
|--------|-------|-----------|
| **Kategorien** | environment, social, education, health, animals, culture | Farbige Chips |
| **Dauer** | 5, 10, 15, 30 Minuten | Quick-Filter "≤10 Min" |
| **Typ** | digital, onsite | Toggle-Chips |
| **Teamgröße** | einzeln, team | Toggle-Chips |

#### Supabase-Abfrage

```typescript
// challengeStore.ts:234-251
const { data: challengeData } = await supabase
  .from('challenges')
  .select('*, organizations(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

---

### 2.3 Challenge Detail

**Datei:** `apps/mobile/app/challenge/[id].tsx`

#### Bildschirm-Sektionen

```
┌────────────────────────────────────┐
│ ┌──────────────────────────────┐   │
│ │        Hero-Bild             │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ 🌱 Umwelt  •  15 Min  •  Digital   │  ← Meta-Zeile
│                                    │
│ Challenge-Titel                    │
│ von Organisation Name              │
│ ────────────────────────────────── │
│ Beschreibung                       │
│ Lorem ipsum dolor sit amet...      │
│ ────────────────────────────────── │
│ Anleitung                          │
│ 1. Schritt eins                    │
│ 2. Schritt zwei                    │
│ ────────────────────────────────── │
│ 📍 Standort (wenn vor Ort)         │
│ 📅 Zeitplan                        │
│ 📧 Kontakt                         │
│ 👥 Team-Infos (wenn Team)          │
│ ────────────────────────────────── │
│ Anforderungen:                     │
│ • Foto-Upload erforderlich         │
│ • 12/50 Plätze belegt              │
│ • 25 XP Belohnung                  │
│                                    │
│ ┌──────────────────────────────┐   │
│ │   Challenge annehmen         │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

#### Button-Zustände

| Zustand | Bedingung | Button-Text | Aktion |
|---------|-----------|-------------|--------|
| **Verfügbar** | Keine Submission vorhanden | "Challenge annehmen" | `acceptChallenge()` |
| **In Bearbeitung** | `status === 'in_progress'` | "Einreichung hochladen" | Öffnet PhotoSubmissionModal |
| **Eingereicht** | `status === 'submitted'` | "Wird überprüft..." | Deaktiviert |
| **Genehmigt** | `status === 'approved'` | "Abgeschlossen ✓" | Deaktiviert |
| **Limit erreicht** | User hat 5 aktive Challenges | "Limit erreicht (5/5)" | Deaktiviert |
| **Ausgebucht** | `currentParticipants >= maxParticipants` | "Ausgebucht" | Deaktiviert |

#### Challenge annehmen (Code-Referenz: `challengeStore.ts:329-381`)

```typescript
acceptChallenge: async (challengeId: string) => {
  // 1. Submission in Supabase erstellen
  const { data } = await supabase
    .from('submissions')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      status: 'in_progress',
      proof_type: challenge.verificationMethod,
    })
    .select()
    .single();

  // 2. Teilnehmerzahl erhöhen
  await supabase.rpc('increment_participants', { challenge_uuid: challengeId });

  // 3. Lokalen State aktualisieren
  set({ submissions: [newSubmission, ...submissions] });
}
```

---

### 2.4 Proof-Einreichung

**Datei:** `apps/mobile/components/PhotoSubmissionModal.tsx`

#### Flow: Ersteinreichung

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Modal öffnen  │ → │ Foto wählen   │ → │ Hochladen     │
│               │    │               │    │               │
│ Kamera /      │    │ Vorschau +    │    │ Supabase      │
│ Galerie       │    │ Beschreibung  │    │ Storage       │
└───────────────┘    └───────────────┘    └───────────────┘
                                                 │
                                                 ▼
                                          Submission UPDATE:
                                          - status: 'submitted'
                                          - proof_url: URL
                                          - submitted_at: now()
```

#### Flow: Bearbeitung (nach Ablehnung)

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Edit-Button   │ → │ Modal öffnet  │ → │ Erneut        │
│ klicken       │    │ mit altem     │    │ einreichen    │
│               │    │ Foto + Caption│    │               │
└───────────────┘    └───────────────┘    └───────────────┘
                                                 │
                                                 ▼
                                          updateProof():
                                          - status zurück auf 'submitted'
                                          - NGO-Feedback gelöscht
                                          - reviewed_at: null
```

**Upload-Prozess (Code-Referenz: `PhotoSubmissionModal.tsx`):**

```typescript
// 1. Bild komprimieren
const result = await ImagePicker.launchImageLibraryAsync({
  quality: 0.8,
  allowsEditing: true,
});

// 2. Zu Supabase Storage hochladen
const { data } = await supabase.storage
  .from('proof-photos')
  .upload(`${userId}/${Date.now()}.jpg`, imageBlob);

// 3. Öffentliche URL abrufen
const { data: { publicUrl } } = supabase.storage
  .from('proof-photos')
  .getPublicUrl(data.path);

// 4. Submission aktualisieren
await submitProof(submissionId, {
  type: 'photo',
  url: publicUrl,
  caption: description,
});
```

---

### 2.5 Meine Challenges

**Datei:** `apps/mobile/app/(tabs)/my-challenges.tsx`

#### Tab-Struktur

```
┌─────────────────────────────────────────────────────────────┐
│  Meine Challenges                              [2/5 aktiv]  │
│ ─────────────────────────────────────────────────────────── │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│  │  Aktiv  │  │ Wartend │  │ Fertig  │                      │
│  └─────────┘  └─────────┘  └─────────┘                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🌱 Baumpflanzaktion                           [✏️]  │   │
│  │    in 2 Tagen fällig                                │   │
│  │    📍 Stadtwald Darmstadt                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📚 Lesepatenschaften organisieren             [✏️]  │   │
│  │    noch 5 Tage                                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Tab-Inhalte

| Tab | Status-Filter | Besondere Features |
|-----|--------------|---------------------|
| **Aktiv** | `in_progress` | Deadline-Urgency (Rot/Orange/Grün), Standort-Info |
| **Wartend** | `submitted` | Edit-Button (Pencil-Icon) → Modal zur Bearbeitung |
| **Fertig** | `approved`, `rejected` | Approved: "Erfolg teilen"-Button; Rejected: NGO-Feedback anzeigen |

#### Deadline-Urgency-Anzeige

| Verbleibende Zeit | Farbe | Anzeige |
|-------------------|-------|---------|
| < 24 Stunden | Rot | "Heute fällig!" |
| < 3 Tage | Orange | "in X Tagen fällig" |
| > 3 Tage | Grün | "noch X Tage" |

---

### 2.6 Community Feed

**Dateien:**
- `apps/mobile/app/(tabs)/community.tsx` — Community-Screen
- `apps/mobile/store/communityStore.ts` — Community-State
- `apps/mobile/components/CommunityPostCard.tsx` — Post-Karte
- `apps/mobile/components/CommentSheet.tsx` — Kommentar-Modal

#### Post-Typen

| Typ | Quelle | Darstellung |
|-----|--------|-------------|
| `success_story` | User nach Challenge-Approval | Vollständige PostCard mit Bild |
| `challenge_completed` | System | Kompakte ActivityCard |
| `badge_earned` | System | Kompakte ActivityCard |
| `level_up` | System | Kompakte ActivityCard |
| `streak_achieved` | System | Kompakte ActivityCard |

#### Interaktionen

```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 👤 Max Mustermann                           vor 2h    │  │
│  │    Level: Helper                                      │  │
│  │ ─────────────────────────────────────────────────────│  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │                                                   │ │  │
│  │ │              Challenge-Foto                       │ │  │
│  │ │                                                   │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │ "Heute Bäume gepflanzt! 🌱"                          │  │
│  │                                                       │  │
│  │ ❤️ 12 Likes    💬 3 Kommentare                        │  │
│  │ ─────────────────────────────────────────────────────│  │
│  │ Anna: "Super gemacht!"                                │  │
│  │ Tim: "War auch dabei!"                                │  │
│  │                                                       │  │
│  │ [Kommentar schreiben...]                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Supabase-Queries

**Posts laden (`communityStore.ts`):**
```typescript
const { data } = await supabase
  .from('community_posts')
  .select(`
    *,
    users!inner(id, name, avatar),
    community_likes(user_id),
    community_comments(id, content, created_at, user_id, users(name, avatar))
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .range(offset, offset + PAGE_SIZE - 1);
```

**Like toggeln:**
```typescript
// Optimistic Update im UI
// Dann Supabase:
if (userHasLiked) {
  await supabase.from('community_likes').delete()
    .eq('post_id', postId).eq('user_id', userId);
} else {
  await supabase.from('community_likes').insert({ post_id: postId, user_id: userId });
}
```

---

### 2.7 Profil

**Datei:** `apps/mobile/app/(tabs)/profile.tsx`

#### Profil-Sektionen

```
┌─────────────────────────────────────────────────────────────┐
│        ┌──────────┐                                         │
│        │  Avatar  │  ← Tappbar für Upload                   │
│        │   📷     │                                         │
│        └──────────┘                                         │
│                                                             │
│        Max Mustermann                                       │
│        max@stud.tu-darmstadt.de                            │
│        ┌────────────────┐                                   │
│        │  🌟 Helper     │  ← Level-Badge                    │
│        └────────────────┘                                   │
│                                                             │
│  XP: 280 / 500                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░  56%                           │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │    5     │  │   2.5    │  │    3     │                  │
│  │Challenges│  │ Stunden  │  │  Badges  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  ┌─────────┐  ┌─────────┐                                   │
│  │  Posts  │  │ Badges  │   ← Tab-Switcher                  │
│  └─────────┘  └─────────┘                                   │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐                                   │
│  │ 📷  │ │ 📷  │ │ 📷  │   ← Posts-Grid                     │
│  └─────┘ └─────┘ └─────┘                                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  ⚙️ Einstellungen                                           │
│  🔔 Benachrichtigungen                                      │
│  🔒 Datenschutz                                             │
│  ❓ Hilfe                                                   │
│  🌐 Sprache: DE | EN                                        │
│  ─────────────────────────────────────────────────────────  │
│  🚪 Abmelden                                                │
└─────────────────────────────────────────────────────────────┘
```

#### Avatar-Upload

**Code-Referenz: `profile.tsx`**

```typescript
const handleAvatarUpload = async () => {
  // 1. Bild aus Galerie wählen
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  // 2. Zu Supabase Storage hochladen
  const filePath = `${user.id}/${Date.now()}.jpg`;
  await supabase.storage.from('avatars').upload(filePath, imageBlob);

  // 3. URL mit Cache-Busting abrufen
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

  // 4. User-Record aktualisieren
  await supabase.from('users').update({ avatar: urlWithCacheBust }).eq('id', user.id);
};
```

---

### 2.8 Echtzeit-Benachrichtigungen

**Implementierung: `apps/mobile/providers/RealtimeProvider.tsx`**

| Channel | Event | Auslöser | Reaktion |
|---------|-------|----------|----------|
| `mobile-challenges` | INSERT/UPDATE auf `challenges` | NGO veröffentlicht Challenge | `loadChallenges()` |
| `mobile-submissions` | UPDATE auf `submissions` | NGO reviewed Submission | Alert + Stats-Refresh |

**Submission-Review Notification:**

```typescript
supabase.channel('mobile-submissions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'submissions',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    const { status, xp_earned, ngo_feedback } = payload.new;

    if (status === 'approved') {
      Alert.alert(
        'Challenge genehmigt! 🎉',
        `Du hast ${xp_earned} XP verdient! Möchtest du deinen Erfolg teilen?`,
        [
          { text: 'Später' },
          { text: 'Teilen', onPress: () => router.push('/my-challenges?tab=completed') }
        ]
      );
      refreshStats(); // XP + Level aktualisieren
    } else if (status === 'rejected') {
      Alert.alert(
        'Einreichung abgelehnt',
        ngo_feedback || 'Bitte überarbeite deine Einreichung.',
        [{ text: 'Bearbeiten', onPress: () => router.push('/my-challenges?tab=pending') }]
      );
    }
  })
  .subscribe();
```

---

## 3. Web Dashboard — Detaillierte User Flows

### 3.1 NGO-Authentifizierung

**Dateien:**
- `apps/web-dashboard/app/login/page.tsx` — Login-Seite
- `apps/web-dashboard/app/register/page.tsx` — Registrierung
- `apps/web-dashboard/store/index.ts` — Auth-State

#### Login-Flow

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Login-Seite  │ → │ Supabase Auth │ → │  Dashboard    │
│               │    │               │    │               │
│ Email/Passwort│    │ Session +     │    │ Org-Daten +   │
│               │    │ ngo_admins    │    │ Challenges    │
└───────────────┘    └───────────────┘    └───────────────┘
```

**Auth-Check (Code-Referenz: `store/index.ts`):**

```typescript
checkAuth: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // NGO-Admin-Link prüfen
  const { data: adminLink } = await supabase
    .from('ngo_admins')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', session.user.id)
    .single();

  if (adminLink?.organizations) {
    set({
      isAuthenticated: true,
      organization: mapDbOrganization(adminLink.organizations),
      userRole: adminLink.role,
    });
  }
}
```

#### Registrierung-Flow

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Registrierung │ → │ Org erstellen │ → │   Pending     │
│               │    │               │    │               │
│ Org-Daten +   │    │ organizations │    │ Warten auf    │
│ Admin-Email   │    │ + ngo_admins  │    │ Verifizierung │
└───────────────┘    └───────────────┘    └───────────────┘
```

**Registrierung (Code-Referenz: `register/page.tsx`):**

```typescript
// 1. Auth-User erstellen
const { data: authData } = await supabase.auth.signUp({ email, password });

// 2. Organisation registrieren (Supabase-Funktion)
const { data: orgId } = await supabase.rpc('register_organization', {
  p_name: orgName,
  p_description: description,
  p_admin_email: email,
  p_user_id: authData.user.id,
});
```

---

### 3.2 Dashboard (Startseite)

**Datei:** `apps/web-dashboard/app/page.tsx`

#### Dashboard-Komponenten

```
┌─────────────────────────────────────────────────────────────────────┐
│  SolvTerra Dashboard                           🔔 Benachrichtigungen │
│ ───────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │     5      │  │    127     │  │     8      │  │   45.5     │     │
│  │  Aktive    │  │ Teilnehmer │  │ Ausstehend │  │  Stunden   │     │
│  │ Challenges │  │            │  │            │  │            │     │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │
│                                                                       │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
│  │ Wöchentliche Aktivität          │  │ Ausstehende Submissions │   │
│  │ ┌──────────────────────────────┐│  │ ───────────────────────  │   │
│  │ │ █ █ █                    │   ││  │ • Max M. - Baumpflanz.. │   │
│  │ │ █ █ █ █                  │   ││  │ • Lena F. - Leseförder..│   │
│  │ │ █ █ █ █ █                │   ││  │ • Tim W. - Müllsammeln  │   │
│  │ │─┼─┼─┼─┼─┼─┼─┼────────────│   ││  │                         │   │
│  │ │Mo Di Mi Do Fr Sa So      │   ││  │ [Alle anzeigen]         │   │
│  │ └──────────────────────────────┘│  └─────────────────────────┘   │
│  └─────────────────────────────────┘                                 │
│                                                                       │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
│  │ Aktive Challenges               │  │ Genehmigungsrate        │   │
│  │ ───────────────────────         │  │ ─────────────────────── │   │
│  │ • Baumpflanzaktion (12/50)      │  │      ┌─────────────┐    │   │
│  │ • Lesepatenschaften (8/20)      │  │      │    85%     │    │   │
│  │ • Müllsammelaktion (5/30)       │  │      │   ███████  │    │   │
│  │                                  │  │      └─────────────┘    │   │
│  │ [Challenge erstellen]           │  │  17 Genehmigt / 3 Abgel.│   │
│  └─────────────────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Statistik-Berechnung

```typescript
// store/index.ts
computeDashboardStats: () => {
  const { challenges, submissions } = get();

  return {
    activeChallenges: challenges.filter(c => c.status === 'active').length,
    totalParticipants: challenges.reduce((sum, c) => sum + c.currentParticipants, 0),
    pendingSubmissions: submissions.filter(s => s.status === 'submitted').length,
    volunteerHours: submissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (s.challenge.durationMinutes / 60), 0),
  };
}
```

---

### 3.3 Challenge-Verwaltung

**Dateien:**
- `apps/web-dashboard/app/challenges/page.tsx` — Liste
- `apps/web-dashboard/app/challenges/new/page.tsx` — Erstellen
- `apps/web-dashboard/app/challenges/[id]/edit/page.tsx` — Bearbeiten

#### Challenge-Liste

| Spalte | Inhalt |
|--------|--------|
| **Titel** | Challenge-Name + Kategorie-Icon |
| **Status** | Badge (Aktiv/Entwurf/Pausiert/Archiviert) |
| **Teilnehmer** | Fortschrittsbalken X/Y |
| **Erstellt** | Datum |
| **Aktionen** | Ansehen, Bearbeiten, Status ändern, Löschen |

#### Challenge erstellen

**Multi-Sektionen-Formular:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Neue Challenge erstellen                                            │
│ ───────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
│  │ Formular                        │  │ Live-Vorschau           │   │
│  │                                  │  │                         │   │
│  │ [Basis-Info    ▼]               │  │ ┌───────────────────┐   │   │
│  │ Titel: ____________             │  │ │                    │   │   │
│  │ Beschreibung: _____             │  │ │   Preview-Card    │   │   │
│  │ Kategorie: [Dropdown]           │  │ │                    │   │   │
│  │                                  │  │ └───────────────────┘   │   │
│  │ [Einstellungen ▼]               │  │                         │   │
│  │ Typ: ○ Digital ● Vor Ort        │  │                         │   │
│  │ Dauer: [15 Min ▼]               │  │                         │   │
│  │ Verifikation: [Foto ▼]          │  │                         │   │
│  │                                  │  │                         │   │
│  │ [Standort     ▼] (wenn vor Ort) │  │                         │   │
│  │ [Zeitplan     ▼]                │  │                         │   │
│  │ [Kontakt      ▼]                │  │                         │   │
│  │ [Team         ▼] (wenn Team)    │  │                         │   │
│  │ [Tags         ▼]                │  │                         │   │
│  │                                  │  │                         │   │
│  │ [Als Entwurf speichern]         │  │                         │   │
│  │ [Veröffentlichen]               │  │                         │   │
│  └─────────────────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### XP-Berechnung

| Dauer | Basis-XP | Team-Bonus (1.5x) |
|-------|----------|-------------------|
| 5 Min | 10 XP | 15 XP |
| 10 Min | 20 XP | 30 XP |
| 15 Min | 25 XP | 38 XP |
| 30 Min | 50 XP | 75 XP |

#### Verifizierungs-Gates

| Org-Status | Erlaubte Aktionen |
|------------|-------------------|
| `pending` | Entwürfe erstellen und bearbeiten |
| `verified` | Challenges veröffentlichen und verwalten |
| `rejected` | Nur lesen, keine neuen Challenges |

---

### 3.4 Submission-Review

**Datei:** `apps/web-dashboard/app/submissions/page.tsx`

#### Layout: Liste + Detail-Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│ Submissions                                                          │
│ ───────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                          │
│  │ Eingereicht│ │ Genehmigt │ │ Abgelehnt │   ← Tab-Filter           │
│  │    (8)     │ │   (42)    │ │    (5)    │                          │
│  └───────────┘ └───────────┘ └───────────┘                          │
│                                                                       │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │
│  │ Submission-Liste        │  │ Detail-Panel                     │   │
│  │                          │  │                                  │   │
│  │ ┌───────────────────┐   │  │ Max Mustermann                   │   │
│  │ │ ✓ Max M.         │   │  │ max@stud.tu-darmstadt.de         │   │
│  │ │   Baumpflanzung   │   │  │ ─────────────────────────────── │   │
│  │ │   vor 2 Stunden   │   │  │                                  │   │
│  │ └───────────────────┘   │  │ Challenge: Baumpflanzaktion      │   │
│  │ ┌───────────────────┐   │  │ Kategorie: 🌱 Umwelt             │   │
│  │ │   Lena F.         │   │  │ Eingereicht: 28.01.2026, 14:32   │   │
│  │ │   Leseförderung   │   │  │                                  │   │
│  │ │   vor 3 Stunden   │   │  │ ┌─────────────────────────────┐ │   │
│  │ └───────────────────┘   │  │ │                              │ │   │
│  │ ┌───────────────────┐   │  │ │       Beweis-Foto           │ │   │
│  │ │   Tim W.          │   │  │ │                              │ │   │
│  │ │   Müllsammeln     │   │  │ └─────────────────────────────┘ │   │
│  │ │   vor 4 Stunden   │   │  │                                  │   │
│  │ └───────────────────┘   │  │ "Heute 5 Bäume gepflanzt!"      │   │
│  │                          │  │                                  │   │
│  │                          │  │ Bewertung: ⭐⭐⭐⭐⭐              │   │
│  │                          │  │ Feedback: ____________           │   │
│  │                          │  │                                  │   │
│  │                          │  │ [Ablehnen]  [Genehmigen]        │   │
│  └─────────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Review-Workflow

**Genehmigung:**

```typescript
approveSubmission: async (id, rating, feedback) => {
  const submission = get().submissions.find(s => s.id === id);
  const xpEarned = submission.challenge.xpReward;

  // 1. Submission aktualisieren
  await supabase.from('submissions').update({
    status: 'approved',
    ngo_rating: rating,
    ngo_feedback: feedback,
    xp_earned: xpEarned,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id);

  // 2. User-XP erhöhen
  await supabase.from('users').update({
    xp: supabase.raw(`xp + ${xpEarned}`),
    completed_challenges: supabase.raw('completed_challenges + 1'),
    hours_contributed: supabase.raw(`hours_contributed + ${submission.challenge.durationMinutes / 60}`),
  }).eq('id', submission.userId);

  // 3. Echtzeit-Notification an Mobile App
  // (automatisch durch Supabase Realtime)
}
```

**Ablehnung:**

```typescript
rejectSubmission: async (id, feedback) => {
  await supabase.from('submissions').update({
    status: 'rejected',
    ngo_feedback: feedback,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id);

  // User kann Einreichung bearbeiten und erneut einreichen
}
```

---

### 3.5 Admin-Portal (SolvTerra-Admins)

**Dateien:**
- `apps/web-dashboard/app/admin/login/page.tsx` — Admin-Login
- `apps/web-dashboard/app/admin/page.tsx` — Admin-Dashboard
- `apps/web-dashboard/app/admin/verifications/page.tsx` — Org-Verifizierung
- `apps/web-dashboard/app/admin/tickets/page.tsx` — Support-Tickets

#### Organisations-Verifizierung

```
┌─────────────────────────────────────────────────────────────────────┐
│ Organisationen verifizieren                                          │
│ ───────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Seniorenhilfe Rhein-Main e.V.                           Pending  ││
│  │ ───────────────────────────────────────────────────────────────  ││
│  │ Kategorie: Social                                                 ││
│  │ Website: www.seniorenhilfe-rm.de                                 ││
│  │ Email: kontakt@seniorenhilfe-rm.de                               ││
│  │ Registriert: 25.01.2026                                          ││
│  │                                                                   ││
│  │ Beschreibung:                                                     ││
│  │ Wir unterstützen Senioren im Rhein-Main-Gebiet...                ││
│  │                                                                   ││
│  │ [Ablehnen]                                    [Verifizieren]     ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Verifizierungs-Workflow:**

```typescript
// Admin verifiziert Organisation
await supabase.rpc('verify_organization', { org_id: organizationId });

// Organisation erhält Notification (Trigger)
// → notifications INSERT mit type: 'verification_approved'

// Admin lehnt Organisation ab
await supabase.rpc('reject_organization', {
  org_id: organizationId,
  rejection_reason: 'Fehlende Nachweise...',
});
```

---

### 3.6 Echtzeit-Updates (StoreProvider)

**Datei:** `apps/web-dashboard/providers/StoreProvider.tsx`

| Channel | Tabelle | Event | Reaktion |
|---------|---------|-------|----------|
| `dashboard-submissions` | `submissions` | INSERT | Toast: "Neue Einreichung von {name}" |
| `dashboard-submissions` | `submissions` | UPDATE | Store-Refresh |
| `dashboard-challenges` | `challenges` | UPDATE | Toast bei neuen Teilnehmern |
| `org-status-{id}` | `organizations` | UPDATE | Verifizierungs-Banner aktualisieren |

---

## 4. Supabase Backend — Schema & Funktionen

### 4.1 Tabellen-Übersicht

| Tabelle | Spalten | Beschreibung | RLS |
|---------|---------|--------------|-----|
| `organizations` | 13 | NGO-Stammdaten, Verifizierungsstatus | ✓ |
| `challenges` | 22 | Aufgaben mit allen Metadaten | ✓ |
| `users` | 7 | Studierenden-Profile (XP, Stats) | ✓ |
| `submissions` | 14 | Einreichungen mit Proof-Daten | ✓ |
| `ngo_admins` | 5 | Verknüpfung NGO ↔ Auth-User | ✓ |
| `solvterra_admins` | 6 | Platform-Admin-System | ✓ |
| `notifications` | 8 | NGO-Benachrichtigungen | ✓ |
| `support_tickets` | 11 | Support & Appeals | ✓ |
| `community_posts` | 12 | Social Feed Posts | ✓ |
| `community_likes` | 4 | Post-Likes (M:N) | ✓ |
| `community_comments` | 5 | Post-Kommentare | ✓ |

### 4.2 Wichtige Tabellen-Details

#### organizations

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  mission TEXT,
  logo TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  category TEXT CHECK (category IN ('environment','social','education','health','animals','culture')),
  verification_status TEXT DEFAULT 'pending' CHECK (...),
  is_verified BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### challenges

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  title_en TEXT,                    -- English translation
  description TEXT NOT NULL,
  description_en TEXT,              -- English translation
  instructions TEXT,
  instructions_en TEXT,             -- English translation
  category TEXT NOT NULL,
  type TEXT DEFAULT 'digital',      -- 'digital' | 'onsite'
  duration_minutes INTEGER DEFAULT 15,
  xp_reward INTEGER DEFAULT 20,
  verification_method TEXT DEFAULT 'photo',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',      -- 'draft' | 'active' | 'paused' | 'archived'
  image_url TEXT,
  location_name TEXT,
  location_address TEXT,
  schedule_type TEXT DEFAULT 'flexible',
  is_multi_person BOOLEAN DEFAULT false,
  min_team_size INTEGER,
  max_team_size INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### submissions

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'in_progress', -- 'in_progress' | 'submitted' | 'approved' | 'rejected'
  proof_type TEXT,                    -- 'photo' | 'text' | 'none'
  proof_url TEXT,
  proof_text TEXT,
  caption TEXT,
  ngo_rating INTEGER CHECK (ngo_rating BETWEEN 1 AND 5),
  ngo_feedback TEXT,
  xp_earned INTEGER,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Wichtige Datenbank-Funktionen

| Funktion | Parameter | Beschreibung |
|----------|-----------|--------------|
| `register_organization` | name, description, admin_email, user_id | Erstellt Org + Admin-Link |
| `verify_organization` | org_id | Setzt Status auf 'verified' |
| `reject_organization` | org_id, reason | Setzt Status auf 'rejected' |
| `increment_participants` | challenge_uuid | current_participants += 1 |
| `recalculate_user_stats` | - | Berechnet XP/Stats für alle User |
| `is_solvterra_admin` | - | Prüft Admin-Berechtigung |
| `create_notification` | org_id, type, title, message | Erstellt Notification |
| `mark_notification_read` | notification_id | Markiert als gelesen |

### 4.4 Trigger

| Trigger | Tabelle | Event | Aktion |
|---------|---------|-------|--------|
| `notify_verification_status_change` | organizations | UPDATE (verification_status) | Notification an NGO |
| `notify_submission_reviewed` | submissions | UPDATE (status) | Notification an NGO |
| `update_ticket_timestamp` | support_tickets | UPDATE | updated_at aktualisieren |

### 4.5 Storage Buckets

| Bucket | Zweck | Policies |
|--------|-------|----------|
| `proof-photos` | Beweis-Fotos für Submissions | Authenticated: INSERT, SELECT; Public: SELECT |
| `avatars` | Profilbilder | Authenticated: INSERT, UPDATE, DELETE; Public: SELECT |

---

## 5. Sicherheit & Datenschutz

### 5.1 Row Level Security (RLS)

| Tabelle | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| `organizations` | Alle | Nur via RPC | Owner | Owner |
| `challenges` | Alle (aktive) | Org-Owner | Org-Owner | Org-Owner |
| `users` | Eigenes Profil | Auth-Trigger | Eigenes Profil | - |
| `submissions` | User: eigene; NGO: eigene Challenges | Auth-User | Status: nur NGO | User (in_progress) |
| `community_posts` | Alle (published) | Auth-User | Eigene | Eigene |

### 5.2 Authentifizierung

- **Supabase Auth** mit Email/Password und Google OAuth
- **Session-Management** via Supabase JWT
- **Separate Auth-Flows** für Studierende (Mobile) und NGOs (Web)
- **Admin-System** mit eigenem Login und Berechtigungen

### 5.3 Datenschutz-Konformität (DSGVO)

| Anforderung | Umsetzung |
|-------------|-----------|
| **Einwilligung** | Explizite Zustimmung bei Registrierung |
| **Datenzugriff** | User können eigene Daten im Profil einsehen |
| **Datenlöschung** | Logout löscht lokale Session; Account-Löschung via Support |
| **Datenminimierung** | Nur notwendige Daten erfasst |
| **Verschlüsselung** | HTTPS + Supabase-Verschlüsselung |

---

## 6. Gamification-System

### 6.1 XP-System

| Aktion | XP |
|--------|-----|
| Challenge abschließen (5 Min) | 10 |
| Challenge abschließen (10 Min) | 20 |
| Challenge abschließen (15 Min) | 25 |
| Challenge abschließen (30 Min) | 50 |
| Team-Challenge (Bonus) | 1.5x |
| Badge verdienen | Variabel (10-100) |

### 6.2 Level-System

| Level | Name | XP-Grenze | Beschreibung |
|-------|------|-----------|--------------|
| 1 | Starter | 0-99 | Neu auf der Plattform |
| 2 | Helper | 100-499 | Erste Challenges gemeistert |
| 3 | Supporter | 500-1999 | Regelmäßig aktiv |
| 4 | Champion | 2000-4999 | Erfahrener Volunteer |
| 5 | Legend | 5000+ | Top-Contributor |

### 6.3 Badge-System

| Badge | Bedingung | XP-Bonus |
|-------|-----------|----------|
| **Erste Schritte** | Erste Challenge abgeschlossen | 10 |
| **Umweltschützer** | 5 Umwelt-Challenges | 25 |
| **Sozialhelfer** | 5 Sozial-Challenges | 25 |
| **Bildungsfreund** | 5 Bildungs-Challenges | 25 |
| **Fleißige Biene** | 10 Challenges insgesamt | 50 |
| **Teamplayer** | 3 Team-Challenges | 30 |
| **Wochenend-Held** | Challenge am Wochenende | 15 |
| **Früher Vogel** | Challenge vor 8 Uhr | 15 |
| **Nachteule** | Challenge nach 20 Uhr | 15 |
| **Streber** | 7-Tage-Streak | 100 |

---

## 7. Internationalisierung

### 7.1 Mobile App (i18next)

**Sprachen:** Deutsch (Standard), Englisch

**Namespaces:**
- `auth` — Authentifizierung
- `challenges` — Challenge-bezogene Texte
- `community` — Community & Social
- `common` — Allgemeine UI-Elemente
- `navigation` — Navigation & Tabs
- `profile` — Profil & Einstellungen

**Entity-Level Übersetzungen:**
```typescript
// useTranslatedChallenge Hook
const { title, description, instructions } = useTranslatedChallenge(challenge);
// Gibt title_en zurück wenn Sprache EN, sonst title
```

**Persistenz:**
```typescript
// languageStore mit AsyncStorage
const languageStore = create(
  persist(
    (set) => ({
      language: 'de',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    { name: 'language-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### 7.2 Web Dashboard

Aktuell nur Deutsch. Keine vollständige i18n-Integration.

**Entity-Level Übersetzungen:**
```typescript
// lib/utils.ts
export function getTranslatedField<T>(item: T, field: keyof T, locale = 'de'): string {
  if (locale === 'en') {
    const enField = `${String(field)}_en` as keyof T;
    if (item[enField]) return String(item[enField]);
  }
  return String(item[field] || '');
}
```

---

## 8. Technische Implementierungsdetails

### 8.1 State Management (Zustand)

**Mobile App Stores:**
- `userStore.ts` — Auth, User-Daten, XP, Badges
- `challengeStore.ts` — Challenges, Submissions, Filter
- `communityStore.ts` — Posts, Likes, Kommentare
- `languageStore.ts` — Sprachpräferenz (persistiert)

**Web Dashboard Store:**
- `store/index.ts` — Alle States kombiniert (Auth, Org, Challenges, Submissions)

### 8.2 Echtzeit-Synchronisation

**Mobile App:**
```typescript
// RealtimeProvider.tsx
const channel = supabase.channel('mobile-submissions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'submissions',
    filter: `user_id=eq.${userId}`,
  }, handleSubmissionUpdate)
  .subscribe();
```

**Web Dashboard:**
```typescript
// StoreProvider.tsx
const channel = supabase.channel('dashboard-submissions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'submissions',
    filter: `challenge_id=in.(${challengeIds.join(',')})`,
  }, handleNewSubmission)
  .subscribe();
```

### 8.3 Bild-Upload & Caching

**Avatar-Upload mit Cache-Busting:**
```typescript
const publicUrl = `${supabaseUrl}?t=${Date.now()}`;
// Verhindert Browser-Caching nach Upload
```

**Proof-Photo Upload:**
```typescript
const filePath = `${userId}/${submissionId}/${Date.now()}.jpg`;
await supabase.storage.from('proof-photos').upload(filePath, blob);
```

### 8.4 Fehlerbehandlung

**Supabase-Fehler:**
```typescript
const { data, error } = await supabase.from('challenges').select();
if (error) {
  console.error('Supabase error:', error);
  Alert.alert('Fehler', 'Daten konnten nicht geladen werden.');
  return;
}
```

**Netzwerk-Fehler:**
```typescript
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (error) {
  if (error.message.includes('network')) {
    Alert.alert('Netzwerkfehler', 'Bitte überprüfe deine Internetverbindung.');
  }
}
```

---

## Anhang A: Demo-Zugangsdaten

| Rolle | Email | Passwort |
|-------|-------|----------|
| **Student** | max.mustermann@stud.tu-darmstadt.de | Test1234 |
| **Student** | roland.kaiser@stud.tu-darmstadt.de | Test1234 |
| **NGO** | kontakt@tafel-rheinmain.de | Test1234 |
| **NGO** | info@nabu-darmstadt.de | Test1234 |
| **Admin** | admin@solvterra.de | Admin1234 |

---

## Anhang B: API-Endpunkte (Supabase)

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/auth/v1/signup` | POST | User registrieren |
| `/auth/v1/token` | POST | Login (Password Grant) |
| `/auth/v1/user` | GET | Aktuellen User abrufen |
| `/rest/v1/challenges` | GET | Challenges laden |
| `/rest/v1/submissions` | POST/PATCH | Submission erstellen/aktualisieren |
| `/rest/v1/community_posts` | GET/POST | Posts laden/erstellen |
| `/storage/v1/object/proof-photos/*` | POST/GET | Bilder hochladen/abrufen |
| `/realtime/v1/websocket` | WS | Echtzeit-Channel |

---

## Anhang C: Navigationsstruktur

### Mobile App

```
app/
├── index.tsx                    → Auth-Check, Redirect
├── (auth)/
│   ├── welcome.tsx              → Onboarding Start
│   ├── sign-up.tsx              → Registrierung
│   ├── sign-in.tsx              → Anmeldung
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

---

*Dokumentation erstellt für Investoren- und Förderpräsentation.*
*SolvTerra — Micro-Volunteering für eine bessere Welt.*
