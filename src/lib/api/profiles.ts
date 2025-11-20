import { supabase } from '../supabase';
import type { Profile } from './auth';

/**
 * Update user profile (display name, avatar)
 */
export async function updateProfile(
  userId: string,
  data: { display_name?: string; avatar_url?: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  await updateProfile(userId, { avatar_url: publicUrl });

  return publicUrl;
}

/**
 * Fetch all user profiles (admin only)
 */
export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Ban a user (admin only)
 */
export async function banUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Unban a user (admin only)
 */
export async function unbanUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: false })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Delete a user profile (admin only)
 * Note: This deletes the profile, which cascades to delete the auth.users record
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Update user ELO (admin only)
 */
export async function updateUserElo(userId: string, elo: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ elo })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Search profiles by display name or email
 */
export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('is_banned', false)
    .order('display_name', { ascending: true });

  if (error) throw error;
  return data || [];
}
