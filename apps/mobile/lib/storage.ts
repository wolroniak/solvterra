import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

export async function pickImage(): Promise<{ uri: string; base64: string } | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets[0] || !result.assets[0].base64) {
    return null;
  }

  return { uri: result.assets[0].uri, base64: result.assets[0].base64 };
}

export async function takePhoto(): Promise<{ uri: string; base64: string } | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets[0] || !result.assets[0].base64) {
    return null;
  }

  return { uri: result.assets[0].uri, base64: result.assets[0].base64 };
}

export async function uploadProofPhoto(
  base64: string,
  submissionId: string,
  fileExt: string = 'jpg'
): Promise<string | null> {
  try {
    const fileName = `${submissionId}-${Date.now()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;
    const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

    const { error } = await supabase.storage
      .from('proof-photos')
      .upload(filePath, decode(base64), {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('proof-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}
