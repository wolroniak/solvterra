import { supabase } from '@/lib/supabase';

type StorageBucket = 'logos' | 'challenges' | 'proof-photos';

/**
 * Delete an image from Supabase Storage.
 * Only deletes if the URL is from our storage (not external URLs).
 */
export async function deleteImage(
  bucket: StorageBucket,
  urlOrPath: string
): Promise<boolean> {
  // Extract path from full URL if needed
  let path = urlOrPath;

  // Check if it's a full URL from our storage
  const storageUrlPattern = /supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
  const match = urlOrPath.match(storageUrlPattern);

  if (match) {
    const [, urlBucket, urlPath] = match;
    // Only delete if it matches the expected bucket
    if (urlBucket !== bucket) {
      console.warn(`URL bucket (${urlBucket}) doesn't match expected bucket (${bucket})`);
      return false;
    }
    path = urlPath;
  } else if (urlOrPath.startsWith('http')) {
    // External URL, don't try to delete
    return false;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error(`Failed to delete image from ${bucket}:`, error);
    return false;
  }

  return true;
}

/**
 * Check if a URL is hosted in our Supabase storage.
 */
export function isStorageUrl(url: string, bucket?: StorageBucket): boolean {
  if (!url) return false;
  const isSupabase = url.includes('supabase.co/storage');
  if (!bucket) return isSupabase;
  return isSupabase && url.includes(`/${bucket}/`);
}

/**
 * Upload an organization logo to Supabase Storage.
 * Replaces existing logo by deleting the old one first.
 */
export async function uploadLogo(
  file: File,
  orgId: string,
  oldLogoUrl?: string | null
): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${orgId}.${ext}`;

  // Delete old logo if it exists and is from our storage
  if (oldLogoUrl && isStorageUrl(oldLogoUrl, 'logos')) {
    await deleteImage('logos', oldLogoUrl);
  }

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting same path
    });

  if (error) {
    console.error('Failed to upload logo:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('logos')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Upload a challenge image to Supabase Storage.
 * Replaces existing image by deleting the old one first.
 */
export async function uploadChallengeImage(
  file: File,
  challengeId: string,
  oldImageUrl?: string | null
): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${challengeId}.${ext}`;

  // Delete old image if it exists and is from our storage
  if (oldImageUrl && isStorageUrl(oldImageUrl, 'challenges')) {
    await deleteImage('challenges', oldImageUrl);
  }

  const { error } = await supabase.storage
    .from('challenges')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting same path
    });

  if (error) {
    console.error('Failed to upload challenge image:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('challenges')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Upload a community post image to Supabase Storage.
 * Uses the existing proof-photos bucket with public read access.
 */
export async function uploadPostImage(
  file: File,
  orgId: string
): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const path = `community/${orgId}-${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from('proof-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Failed to upload image:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('proof-photos')
    .getPublicUrl(path);

  return data.publicUrl;
}
