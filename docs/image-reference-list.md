# SolvTerra Image Reference List

**How to update images:**
1. **Supabase Storage (Recommended)**: Upload to Supabase Dashboard → Storage → select bucket → Upload
2. **Direct URL**: Update the database field with a new URL (Unsplash, Picsum, or your own hosted images)

**Supabase Storage Buckets:**
- `avatars` - User profile pictures
- `proof-photos` - Submission proofs and community post images

**Base Storage URL:** `https://qoiujdxivwnymyftnxlc.supabase.co/storage/v1/object/public/`

---

## 1. USER AVATARS

| User | ID | Current Image | How to Update |
|------|-----|---------------|---------------|
| **Nico Jerez** | `b6bd10dc-b63b-498c-8e29-7cdad6c9bc56` | **NONE** | Upload to `avatars/{user_id}.jpg` |
| Max Mustermann | `35a17bd0-bd42-41e7-b567-325e9accdea7` | Supabase Storage | Already uploaded |
| Roland Kaiser | `2b29867b-60bd-483a-8eec-a3dcfc10ca7d` | Supabase Storage | Already uploaded |
| Marieke Euler | `c57a4cc5-d676-49ad-9c68-42662dd933ed` | DiceBear (generated) | Upload to replace |
| Anna Becker | `6373ae79-0e2c-4674-a4d0-82d2ccd22f62` | DiceBear (generated) | Upload to replace |
| Jacob Otto | `c887c11a-068f-4d43-ad13-535177530e33` | DiceBear (generated) | Upload to replace |

**SQL to update avatar:**
```sql
UPDATE users SET avatar = 'YOUR_NEW_URL' WHERE id = 'USER_ID';
```

---

## 2. ORGANIZATION LOGOS

| Organization | ID | Current Image |
|--------------|-----|---------------|
| NABU Ortsgruppe Darmstadt | `11111111-0000-0000-0000-000000000001` | Unsplash bird photo |
| Tafel Rhein-Main e.V. | `11111111-0000-0000-0000-000000000002` | Unsplash food donation |
| Bildungsinitiative Frankfurt | `11111111-0000-0000-0000-000000000003` | Unsplash classroom |
| **Tierheim Darmstadt e.V.** | `11111111-0000-0000-0000-000000000004` | Unsplash dogs |
| Deutsches Rotes Kreuz Hessen | `11111111-0000-0000-0000-000000000005` | Unsplash medical |
| Kulturbrücke Mainz | `11111111-0000-0000-0000-000000000006` | Unsplash community |
| Seniorenhilfe Rhein-Main | `11111111-0000-0000-0000-000000000007` | Unsplash elderly |

**SQL to update logo:**
```sql
UPDATE organizations SET logo = 'YOUR_NEW_URL' WHERE id = 'ORG_ID';
```

---

## 3. CHALLENGE IMAGES

### NABU Ortsgruppe Darmstadt (Environment)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Müllsammeln im Stadtwald | `33333333-0000-0000-0000-000000000001` | Unsplash trash cleanup |
| Teile unseren Naturschutzbeitrag | `33333333-0000-0000-0000-000000000002` | Unsplash nature |
| Nistkästen bauen - Teamaktion | `33333333-0000-0000-0000-000000000013` | Unsplash birdhouse |

### Tafel Rhein-Main e.V. (Social)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Lebensmittel sortieren | `33333333-0000-0000-0000-000000000003` | Unsplash food sorting |
| Social Media Beitrag teilen | `33333333-0000-0000-0000-000000000004` | Unsplash social media |
| Flyer in der Innenstadt verteilen | `33333333-0000-0000-0000-000000000015` | Unsplash flyer |

### Bildungsinitiative Frankfurt (Education)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Lernmaterialien recherchieren | `33333333-0000-0000-0000-000000000005` | Unsplash studying |
| Erklärvideo erstellen | `33333333-0000-0000-0000-000000000006` | Unsplash video |

### Tierheim Darmstadt e.V. (Animals) - DEMO ORG
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Tierprofil für Social Media erstellen | `33333333-0000-0000-0000-000000000007` | Unsplash dog |
| Gassi gehen mit Tierheimhund | `33333333-0000-0000-0000-000000000008` | Unsplash walking dog |
| **Zeige uns die Tierfreunde-Community!** | `1b5f95da-901b-4fb4-8697-2ae979db8e22` | **NONE - NEEDS IMAGE!** |

### Deutsches Rotes Kreuz Hessen (Health)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Erste-Hilfe-Quiz absolvieren | `33333333-0000-0000-0000-000000000009` | Unsplash first aid |
| Blutspendetermin unterstützen | `33333333-0000-0000-0000-000000000010` | Unsplash blood donation |

### Kulturbrücke Mainz (Culture)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Sprachcafé - Deutsch üben | `33333333-0000-0000-0000-000000000011` | Unsplash conversation |
| Lieblingsrezept teilen | `33333333-0000-0000-0000-000000000012` | Unsplash cooking |

### Seniorenhilfe Rhein-Main (Social)
| Challenge | ID | Current Image |
|-----------|-----|---------------|
| Telefonat mit Senior | `33333333-0000-0000-0000-000000000014` | Unsplash elderly phone |

**SQL to update challenge image:**
```sql
UPDATE challenges SET image_url = 'YOUR_NEW_URL' WHERE id = 'CHALLENGE_ID';
```

---

## 4. SUBMISSION PROOFS (Real uploads from app)

### Supabase Storage (Real photos taken in app)
| User | Challenge | Submission ID | Storage Path |
|------|-----------|---------------|--------------|
| Max Mustermann | Social Media Beitrag | `6846ae0a-5a56-46dc-a9f6-0dd51df1d3db` | `proof-photos/proofs/6846ae0a...` |
| Marieke Euler | Müllsammeln | `41550d84-0183-45fd-ad79-a420f583e00b` | `proof-photos/proofs/41550d84...` |
| Max Mustermann | Flyer verteilen | `a3b03249-6be4-4e92-b026-0c15ad01fb82` | `proof-photos/proofs/a3b03249...` |

### Placeholder Images (Mock data)
| User | Challenge | Submission ID | Current URL |
|------|-----------|---------------|-------------|
| Marieke Euler | Social Media | `55555555-0004-0000-0000-000000000004` | picsum.photos/seed/marieke-social |
| Roland Kaiser | Gassi gehen | `55555555-0003-0000-0000-000000000003` | picsum.photos/seed/roland-gassi |
| Marieke Euler | Sprachcafé | `55555555-0004-0000-0000-000000000003` | picsum.photos/seed/marieke-sprach |
| Anna Becker | Flyer verteilen | `55555555-0002-0000-0000-000000000003` | picsum.photos/seed/anna-flyer |
| Roland Kaiser | Tierprofil | `55555555-0003-0000-0000-000000000001` | picsum.photos/seed/roland-tier |
| Anna Becker | Rezept teilen | `55555555-0002-0000-0000-000000000002` | picsum.photos/seed/anna-rezept |
| Jacob Otto | Tierprofil | `55555555-0001-0000-0000-000000000002` | picsum.photos/seed/jacob-tier |
| Jacob Otto | Social Media | `55555555-0001-0000-0000-000000000003` | picsum.photos/seed/jacob-social |
| Marieke Euler | Rezept teilen | `55555555-0004-0000-0000-000000000001` | picsum.photos/seed/marieke-rezept |
| Anna Becker | Naturschutz | `55555555-0002-0000-0000-000000000001` | picsum.photos/seed/anna-natur |

**SQL to update submission proof:**
```sql
UPDATE submissions SET proof_url = 'YOUR_NEW_URL' WHERE id = 'SUBMISSION_ID';
```

---

## 5. COMMUNITY POST IMAGES

| Author | Post Type | Content Preview | Post ID | Current Image |
|--------|-----------|-----------------|---------|---------------|
| Roland Kaiser | success_story | Heute mit Bello... | `77777777-0000-0000-0003-000000000001` | picsum (roland-gassi) |
| Marieke Euler | success_story | Sprachcafé Abend... | `77777777-0000-0000-0004-000000000001` | picsum (marieke-sprach) |
| Anna Becker | challenge_completed | Flyer für Tafel... | `77777777-0000-0000-0002-000000000003` | picsum (anna-flyer) |
| **Tierheim** | ngo_promotion | Fellnasen brauchen... | `77777777-0000-0000-0005-000000000001` | picsum (tierheim-dogs) |
| Tafel | ngo_promotion | 5 Jahre alt... | `ae1f0350-b548-40c5-b8e9-7a578b6cdfa3` | Supabase Storage |
| Max Mustermann | success_story | Müll gesammelt... | `77777777-0000-0000-0000-000000000001` | Unsplash |
| Kulturbrücke | ngo_promotion | Sprachcafé Mainz... | `77777777-0000-0000-0005-000000000003` | picsum (kulturbruecke) |
| NABU | ngo_promotion | Nistkästen bauen... | `77777777-0000-0000-0000-000000000003` | Unsplash |
| Anna Becker | success_story | Omas Apfelkuchen... | `77777777-0000-0000-0002-000000000002` | picsum (anna-rezept) |
| Anna Becker | success_story | NABU Insektenschutz... | `77777777-0000-0000-0002-000000000001` | picsum (anna-natur) |

**SQL to update community post image:**
```sql
UPDATE community_posts SET image_url = 'YOUR_NEW_URL' WHERE id = 'POST_ID';
```

---

## PRIORITY ITEMS FOR DEMO

1. **Nico's Avatar** - Currently NULL, needs a photo
2. **Demo Challenge Image** - "Zeige uns die Tierfreunde-Community!" has no image
3. **Tierheim NGO Promotion Post** - Uses placeholder, should have real animal photo

---

## IMAGE SOURCES

- **Supabase Storage**: Upload directly in Supabase Dashboard → Storage
- **Unsplash**: Free high-quality photos - `https://images.unsplash.com/photo-ID?w=800`
- **Picsum**: Placeholder photos - `https://picsum.photos/seed/YOUR-SEED/800/600`
- **DiceBear**: Generated avatars - `https://api.dicebear.com/7.x/avataaars/svg?seed=NAME`
