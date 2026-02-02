import { supabase } from '@/lib/supabase';

/**
 * Upload a community post image to Supabase Storage.
 * Uses the existing proof-photos bucket with public read access.
 */
export async function uploadPostImage(
  file: File,
  orgId: string,
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
