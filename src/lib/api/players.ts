import { supabase } from '../supabase';

export interface PlayerDB {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  created_by: string | null;
  created_at: string;
}

/**
 * Fetch all players for the current user
 */
export async function fetchPlayers(): Promise<PlayerDB[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new player
 */
export async function addPlayer(name: string): Promise<PlayerDB> {
  const { data, error } = await supabase
    .from('players')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('Error adding player:', error);
    throw error;
  }

  return data;
}

/**
 * Update player stats (elo, wins, losses)
 */
export async function updatePlayerStats(
  playerId: string,
  stats: { elo?: number; wins?: number; losses?: number }
): Promise<void> {
  const { error } = await supabase
    .from('players')
    .update(stats)
    .eq('id', playerId);

  if (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
}

/**
 * Delete a player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}

/**
 * Add a player from an existing profile
 * If the profile is already linked to a player, returns the existing player
 */
export async function addPlayerFromProfile(
  profileId: string, 
  name: string,
  elo?: number,
  wins?: number,
  losses?: number
): Promise<PlayerDB> {
  // First check if this profile already has a linked player
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (existingPlayer) {
    // Player already exists for this profile, return it
    return existingPlayer;
  }

  // Create new player linked to the profile
  const { data, error } = await supabase
    .from('players')
    .insert({ 
      name,
      elo: elo || 1200,
      wins: wins || 0,
      losses: losses || 0,
      profile_id: profileId
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding player from profile:', error);
    throw error;
  }

  return data;
}

