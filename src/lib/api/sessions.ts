import type { Database } from "../database.types";
import { supabase } from "../supabase";

// Type definitions
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
export type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

export interface SessionState {
  partnershipHistory: { [playerId: string]: string[] };
  oppositionHistory: { [playerId: string]: string[] };
  rounds: any[];
}

export interface SessionWithDetails extends Session {
  player_count?: number;
  match_count?: number;
}

// ============================================================================
// SESSION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new session
 */
export async function createSession(
  name: string,
  courtCount: number = 1,
  randomnessLevel: number = 0.5
): Promise<Session> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      name,
      court_count: courtCount,
      randomness_level: randomnessLevel,
      created_by: user.user.id,
      status: "active",
      current_round: 0,
      state: {
        partnershipHistory: {},
        oppositionHistory: {},
        rounds: [],
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all sessions for the current user
 */
export async function getUserSessions(
  includeFinished: boolean = true
): Promise<SessionWithDetails[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  let query = supabase
    .from("sessions")
    .select(
      `
      *,
      players:players(count),
      matches:matches(count)
    `
    )
    .eq("created_by", user.user.id)
    .order("created_at", { ascending: false });

  if (!includeFinished) {
    query = query.in("status", ["active", "paused"]);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transform the data to include counts
  return (data || []).map((session: any) => ({
    ...session,
    player_count: session.players?.[0]?.count || 0,
    match_count: session.matches?.[0]?.count || 0,
  }));
}

/**
 * Get active sessions for the current user
 */
export async function getActiveSessions(): Promise<SessionWithDetails[]> {
  return getUserSessions(false);
}

/**
 * Get a specific session by ID
 */
export async function getSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get the most recent active session
 */
export async function getMostRecentActiveSession(): Promise<Session | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("created_by", user.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Update session state (matchmaker data)
 */
export async function updateSessionState(
  sessionId: string,
  state: SessionState,
  currentRound: number
): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .update({
      state,
      current_round: currentRound,
    })
    .eq("id", sessionId);

  if (error) throw error;
}

/**
 * Update session configuration
 */
export async function updateSessionConfig(
  sessionId: string,
  courtCount?: number,
  randomnessLevel?: number
): Promise<void> {
  const updates: any = {};
  if (courtCount !== undefined) updates.court_count = courtCount;
  if (randomnessLevel !== undefined) updates.randomness_level = randomnessLevel;

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) throw error;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: "active" | "paused" | "finished"
): Promise<void> {
  const updates: any = { status };
  if (status === "finished") {
    updates.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) throw error;
}

/**
 * Finish a session
 */
export async function finishSession(sessionId: string): Promise<void> {
  await updateSessionStatus(sessionId, "finished");
}

/**
 * Pause a session
 */
export async function pauseSession(sessionId: string): Promise<void> {
  await updateSessionStatus(sessionId, "paused");
}

/**
 * Resume a session
 */
export async function resumeSession(sessionId: string): Promise<void> {
  await updateSessionStatus(sessionId, "active");
}

/**
 * Delete a session (and all associated data via cascade)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw error;
}

// ============================================================================
// PLAYER MANAGEMENT WITHIN SESSION
// ============================================================================

/**
 * Add a player to a session
 */
export async function addPlayerToSession(
  sessionId: string,
  name: string,
  options?: {
    elo?: number;
    wins?: number;
    losses?: number;
  }
): Promise<Database["public"]["Tables"]["players"]["Row"]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("players")
    .insert({
      session_id: sessionId,
      name,
      elo: options?.elo ?? 1200,
      wins: options?.wins ?? 0,
      losses: options?.losses ?? 0,
      games_played: 0,
      last_played_round: -1,
      rest_rounds: 0,
      is_active: true,
      created_by: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all players in a session
 */
export async function getSessionPlayers(
  sessionId: string
): Promise<Database["public"]["Tables"]["players"]["Row"][]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", sessionId)
    .order("name");

  if (error) throw error;
  return data || [];
}

/**
 * Update a player in a session
 */
export async function updateSessionPlayer(
  playerId: string,
  updates: Database["public"]["Tables"]["players"]["Update"]
): Promise<void> {
  const { error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", playerId);

  if (error) throw error;
}

/**
 * Remove a player from a session
 */
export async function removePlayerFromSession(playerId: string): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw error;
}

/**
 * Toggle player active status in session
 */
export async function togglePlayerActiveInSession(
  playerId: string,
  isActive: boolean
): Promise<void> {
  await updateSessionPlayer(playerId, { is_active: isActive });
}

// ============================================================================
// MATCH RECORDING
// ============================================================================

/**
 * Save a match to the database
 */
export async function saveMatch(
  sessionId: string,
  match: {
    court: number;
    roundNumber: number;
    team1PlayerIds: string[];
    team2PlayerIds: string[];
    winnerTeam?: 1 | 2;
    score?: string;
  }
): Promise<Database["public"]["Tables"]["matches"]["Row"]> {
  // Create the match record
  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .insert({
      session_id: sessionId,
      court_number: match.court,
      round_number: match.roundNumber,
      winner_team: match.winnerTeam,
      score: match.score,
      match_timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (matchError) throw matchError;

  // Create match_players records
  const matchPlayers = [
    ...match.team1PlayerIds.map((playerId) => ({
      match_id: matchData.id,
      player_id: playerId,
      team: 1,
    })),
    ...match.team2PlayerIds.map((playerId) => ({
      match_id: matchData.id,
      player_id: playerId,
      team: 2,
    })),
  ];

  const { error: playersError } = await supabase
    .from("match_players")
    .insert(matchPlayers);

  if (playersError) throw playersError;

  return matchData;
}

/**
 * Get all matches for a session
 */
export async function getSessionMatches(
  sessionId: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      match_players (
        player_id,
        team,
        profiles (
          id,
          display_name
        )
      )
    `
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Update match result
 */
export async function updateMatchResult(
  matchId: string,
  winnerTeam: 1 | 2,
  score?: string
): Promise<void> {
  const { error } = await supabase
    .from("matches")
    .update({
      winner_team: winnerTeam,
      score,
      finished_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw error;
}

// ============================================================================
// SESSION EXPORT
// ============================================================================

/**
 * Export session data to CSV format
 */
export async function exportSessionToCSV(sessionId: string): Promise<string> {
  const session = await getSession(sessionId);
  const players = await getSessionPlayers(sessionId);
  const matches = await getSessionMatches(sessionId);

  // Build CSV content
  let csv = `Session: ${session.name}\n`;
  csv += `Date: ${new Date(session.created_at).toLocaleDateString()}\n`;
  csv += `Courts: ${session.court_count}\n`;
  csv += `Total Rounds: ${session.current_round}\n`;
  csv += `\n`;

  // Players section
  csv += `Players\n`;
  csv += `Name,Games Played,ELO,Wins,Losses\n`;
  players.forEach((player) => {
    csv += `${player.name},${player.games_played},${player.elo},${player.wins},${player.losses}\n`;
  });

  csv += `\n`;

  // Matches section
  csv += `Matches\n`;
  csv += `Round,Court,Team 1 Players,Team 2 Players,Winner,Score\n`;
  matches.forEach((match) => {
    const team1Players = match.match_players
      ?.filter((mp: any) => mp.team === 1)
      .map((mp: any) => mp.profiles?.display_name || mp.player_id)
      .join(" & ");
    const team2Players = match.match_players
      ?.filter((mp: any) => mp.team === 2)
      .map((mp: any) => mp.profiles?.display_name || mp.player_id)
      .join(" & ");
    csv += `${match.round_number},${match.court_number},${team1Players},${team2Players},Team ${match.winner_team || "-"},${match.score || "-"}\n`;
  });

  return csv;
}

/**
 * Download session as CSV file
 */
export function downloadSessionCSV(sessionId: string, filename?: string): Promise<void> {
  return exportSessionToCSV(sessionId).then((csv) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename || `session-${sessionId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
