# Image Upload Feature Design

**Date:** 2026-02-03
**Status:** Approved
**Priority:** Logo → Challenge → Posts

---

## Overview

Add image upload functionality to the web-dashboard so NGOs can manage all platform images directly, without needing to paste external URLs.

### Features to Implement

1. **Settings Page - Logo Upload**: NGOs can change their profile picture
2. **Challenge Edit - Image Upload**: Upload images when editing challenges (not just URL)
3. **Community Posts - Edit & Delete**: Manage existing posts with inline actions

---

## Decisions

| Decision | Choice |
|----------|--------|
| Bucket structure | Separate buckets: `logos`, `challenges`, `proof-photos` |
| Post edit/delete | Inline actions (dropdown menu on cards) |
| Logo replacement | Delete old, upload new |
| Challenge images | Same replace-and-delete pattern |
| File size limit | 2 MB |
| Implementation order | Logo → Challenge → Posts |

---

## Storage Architecture

### Buckets

| Bucket | Purpose | Path Pattern |
|--------|---------|--------------|
| `logos` | Organization profile pictures | `{orgId}.{ext}` |
| `challenges` | Challenge header images | `{challengeId}.{ext}` |
| `proof-photos` | Community posts, submissions | `community/{orgId}-{timestamp}.{ext}` |

### Bucket Policies

All buckets:
- **Public read access** - Anyone can view images via public URL
- **Authenticated write** - Only logged-in org owners can upload/delete

### Storage Utilities (`lib/storage.ts`)

```typescript
// Upload organization logo (deletes old)
uploadLogo(file: File, orgId: string): Promise<string | null>

// Upload challenge image (deletes old)
uploadChallengeImage(file: File, challengeId: string): Promise<string | null>

// Existing - community post images
uploadPostImage(file: File, orgId: string): Promise<string | null>

// Helper for cleanup
deleteImage(bucket: string, path: string): Promise<boolean>
```

---

## Reusable Component: ImageUpload

**File:** `components/ui/image-upload.tsx`

### Props

```typescript
interface ImageUploadProps {
  value?: string;              // Current image URL (for edit mode)
  onChange: (url: string | null, file?: File) => void;
  bucket: 'logos' | 'challenges' | 'proof-photos';
  aspectRatio?: 'square' | '16:9' | 'free';
  maxSizeMB?: number;          // Default: 2
  disabled?: boolean;
  placeholder?: string;
}
```

### Features

- Drag & drop zone with visual feedback
- Click to open file picker
- Tab toggle: "Upload" / "URL eingeben"
- Image preview with remove button
- File validation (size ≤ 2MB, type: JPG/PNG/WebP/SVG)
- Error messages for invalid files
- Loading state during upload

---

## Feature 1: Settings Page - Logo Upload

**File:** `app/settings/page.tsx`

### UI Flow

1. Current logo displayed (or placeholder if none)
2. Click "Logo ändern" → reveals ImageUpload component
3. User uploads/selects image → preview shown
4. Click "Änderungen speichern":
   - Upload to `logos/{orgId}.ext`
   - Update `organizations.logo` in DB
   - Delete old logo file (if exists)
5. Success toast: "Logo erfolgreich aktualisiert"

### State

```typescript
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
const [isLogoEditing, setIsLogoEditing] = useState(false);
```

---

## Feature 2: Challenge Edit - Image Upload

**File:** `app/challenges/[id]/edit/page.tsx`

### Changes

Replace URL-only input with `<ImageUpload>` component.

### UI Flow

1. Current challenge image shown in preview
2. User uploads new image or pastes URL
3. On "Speichern":
   - If file selected: upload to `challenges/{challengeId}.ext`
   - Delete old image (if hosted in our bucket)
   - Update `challenges.image_url` in DB

### Detection Logic

Only delete old image if hosted in our bucket:
```typescript
const isOurImage = (url: string) =>
  url.includes('supabase.co/storage') && url.includes('/challenges/');
```

---

## Feature 3: Community Posts - Edit & Delete

### Files to Modify

- `components/community-post-card.tsx` - Add action buttons
- `app/community/page.tsx` - Handle callbacks
- New: `components/edit-post-modal.tsx` - Edit form modal

### Post Card Actions

Dropdown menu (three dots) on cards owned by current org:
- **Bearbeiten** - Opens edit modal
- **Löschen** - Confirmation dialog → delete

### Edit Modal

- Title input
- Content textarea
- ImageUpload component
- Linked challenge dropdown
- Save/Cancel buttons

### Delete Flow

1. Click "Löschen" → Confirmation dialog
2. Confirm → `deletePost(postId)`
3. Delete image from storage if exists
4. Success toast: "Beitrag gelöscht"

---

## i18n Keys to Add

### `locales/de/settings.json`

```json
{
  "logoUpdated": "Logo erfolgreich aktualisiert",
  "logoUpdateFailed": "Logo konnte nicht aktualisiert werden"
}
```

### `locales/de/community.json`

```json
{
  "editPost": "Bearbeiten",
  "deletePost": "Löschen",
  "deleteConfirmTitle": "Beitrag löschen?",
  "deleteConfirmMessage": "Dieser Beitrag wird unwiderruflich gelöscht.",
  "deleteConfirmButton": "Ja, löschen",
  "postDeleted": "Beitrag gelöscht",
  "postUpdated": "Beitrag aktualisiert"
}
```

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Create `logos` bucket in Supabase
- [ ] Create `challenges` bucket in Supabase
- [ ] Add bucket policies (public read, authenticated write)
- [ ] Create `components/ui/image-upload.tsx`
- [ ] Extend `lib/storage.ts` with new upload functions

### Phase 2: Logo Upload
- [ ] Update `app/settings/page.tsx` with ImageUpload
- [ ] Wire up save functionality
- [ ] Add i18n keys
- [ ] Test upload and replacement

### Phase 3: Challenge Image Upload
- [ ] Update `app/challenges/[id]/edit/page.tsx`
- [ ] Replace URL input with ImageUpload
- [ ] Handle upload on save
- [ ] Test with existing challenges

### Phase 4: Post Edit/Delete
- [ ] Add dropdown menu to `community-post-card.tsx`
- [ ] Create `components/edit-post-modal.tsx`
- [ ] Wire up edit functionality
- [ ] Wire up delete with confirmation
- [ ] Add i18n keys
- [ ] Test full flow

---

## File Changes Summary

### New Files
- `components/ui/image-upload.tsx`
- `components/edit-post-modal.tsx`

### Modified Files
- `lib/storage.ts`
- `app/settings/page.tsx`
- `app/challenges/[id]/edit/page.tsx`
- `components/community-post-card.tsx`
- `app/community/page.tsx`
- `locales/de/settings.json`
- `locales/en/settings.json`
- `locales/de/community.json`
- `locales/en/community.json`
