# SolvTerra Supabase Database

Dieses Verzeichnis enthält die Datenbankdefinitionen für SolvTerra.

## Struktur

```
supabase/
├── schema.sql          # Vollständiges Datenbankschema (Tabellen, RLS, Funktionen, Trigger)
├── seed.sql            # Demo-Daten für Entwicklung und Testing
├── migrations/         # Zukünftige Migrationen (leer)
├── archive/
│   └── migrations/     # Archivierte historische Migrationen (001-013)
└── README.md           # Diese Datei
```

## Dateien

### schema.sql

Konsolidiertes Schema mit allen Tabellen:

| Tabelle | Beschreibung |
|---------|--------------|
| `users` | Studenten-Profile (verknüpft mit auth.users) |
| `organizations` | NGO-Profile |
| `ngo_admins` | NGO-Admin-Zuordnungen (auth.users → organizations) |
| `solvterra_admins` | Plattform-Administratoren |
| `challenges` | Micro-Volunteering Aufgaben |
| `submissions` | Einreichungen der Studenten |
| `notifications` | In-App Benachrichtigungen |
| `support_tickets` | Support-Anfragen |
| `community_posts` | Community-Feed Posts |
| `community_likes` | Likes auf Posts |
| `community_comments` | Kommentare auf Posts |

Enthält auch:
- Alle RLS (Row Level Security) Policies
- Indizes für Performance
- Hilfsfunktionen (handle_new_user, update_updated_at, etc.)
- Trigger für automatische Timestamps
- Storage-Bucket-Konfiguration (proof-photos, avatars)

### seed.sql

Demo-Daten für Entwicklung mit echten auth.users IDs:

- 7 Organisationen (6 verifiziert, 1 ausstehend)
- 7 NGO-Admins (verknüpft mit realen auth.users)
- 1 SolvTerra-Admin
- 1 Student (Max Mustermann)
- 15 diverse Challenges
- 4 Submissions in verschiedenen Status
- Community-Posts, Likes, Kommentare

## Anwendung

### Neues Projekt aufsetzen

1. Supabase-Projekt erstellen
2. Auth-User in Supabase Dashboard anlegen
3. `seed.sql` mit korrekten auth.users IDs anpassen
4. Schema und Seed ausführen:

```sql
-- In Supabase SQL Editor:
-- 1. schema.sql ausführen
-- 2. seed.sql ausführen
```

### Neue Migration erstellen

Für Schemaänderungen eine neue Migrationsdatei in `migrations/` anlegen:

```
migrations/
└── 014_neue_feature.sql
```

Nach erfolgreicher Anwendung kann die Migration bei Bedarf ins Archiv verschoben werden.

## Archiv

Das Verzeichnis `archive/migrations/` enthält historische Migrationen (001-013), die in das konsolidierte `schema.sql` integriert wurden. Diese werden nicht mehr benötigt, sind aber zur Referenz aufbewahrt.

## Hinweise

- **auth.users**: NGO-Admins und Studenten existieren in `auth.users`, aber nur Studenten haben einen Eintrag in `public.users`
- **Foreign Keys**: `community_likes` und `community_comments` referenzieren `auth.users(id)`, nicht `public.users(id)`
- **RLS**: Alle Tabellen haben Row Level Security aktiviert mit entsprechenden Policies
