-- Migration: Add Session Management Features
-- Description: Enhance sessions table and players table to support full session management
-- Date: 2025-11-21

-- ============================================================================
-- 1. UPDATE SESSIONS TABLE
-- ============================================================================

-- Add columns to store matchmaker state
ALTER TABLE public.sessions 
  ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add constraint for status
ALTER TABLE public.sessions 
  DROP CONSTRAINT IF EXISTS sessions_status_check;

ALTER TABLE public.sessions 
  ADD CONSTRAINT sessions_status_check 
  CHECK (status IN ('active', 'paused', 'finished'));

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON public.sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);

-- Add comment
COMMENT ON COLUMN public.sessions.state IS 'JSONB containing partnershipHistory, oppositionHistory, and rounds data';
COMMENT ON COLUMN public.sessions.current_round IS 'Current round number in this session';
COMMENT ON COLUMN public.sessions.status IS 'Session status: active, paused, or finished';

-- ============================================================================
-- 2. UPDATE PLAYERS TABLE
-- ============================================================================

-- Add session-related columns to players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_played_round INTEGER DEFAULT -1,
  ADD COLUMN IF NOT EXISTS rest_rounds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_players_session_id ON public.players(session_id);
CREATE INDEX IF NOT EXISTS idx_players_created_by ON public.players(created_by);

-- Add comments
COMMENT ON COLUMN public.players.session_id IS 'If set, this player belongs to a specific session';
COMMENT ON COLUMN public.players.games_played IS 'Number of games played in current session';
COMMENT ON COLUMN public.players.last_played_round IS 'Last round number this player participated in';
COMMENT ON COLUMN public.players.rest_rounds IS 'Number of rounds since last played';
COMMENT ON COLUMN public.players.is_active IS 'Whether player is currently active in session';

-- ============================================================================
-- 3. UPDATE MATCHES TABLE
-- ============================================================================

-- Add columns to store round information
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS round_number INTEGER,
  ADD COLUMN IF NOT EXISTS match_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_matches_session_id ON public.matches(session_id);
CREATE INDEX IF NOT EXISTS idx_matches_round_number ON public.matches(round_number);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);

-- Add comments
COMMENT ON COLUMN public.matches.round_number IS 'Round number this match belongs to';
COMMENT ON COLUMN public.matches.match_timestamp IS 'When the match was played/recorded';

-- ============================================================================
-- 4. UPDATE RLS POLICIES
-- ============================================================================

-- Drop existing session policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create new session policies
CREATE POLICY "Users can view their own sessions" 
  ON public.sessions FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "Users can create sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own sessions" 
  ON public.sessions FOR UPDATE 
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own sessions" 
  ON public.sessions FOR DELETE 
  USING (created_by = auth.uid());

-- Update players policies to support session-based access
DROP POLICY IF EXISTS "Users can insert their own players" ON public.players;
DROP POLICY IF EXISTS "Users can update their own players" ON public.players;
DROP POLICY IF EXISTS "Users can delete their own players" ON public.players;
DROP POLICY IF EXISTS "Users can view their own players" ON public.players;

-- New players policies
CREATE POLICY "Users can view their own players" 
  ON public.players FOR SELECT 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = players.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert players" 
  ON public.players FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() AND (
      session_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM sessions 
        WHERE id = session_id AND created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own players" 
  ON public.players FOR UPDATE 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = players.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own players" 
  ON public.players FOR DELETE 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = players.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

-- Matches policies
DROP POLICY IF EXISTS "Users can view matches in their sessions" ON public.matches;
DROP POLICY IF EXISTS "Users can insert matches in their sessions" ON public.matches;
DROP POLICY IF EXISTS "Users can update matches in their sessions" ON public.matches;
DROP POLICY IF EXISTS "Users can delete matches in their sessions" ON public.matches;

CREATE POLICY "Users can view matches in their sessions" 
  ON public.matches FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = matches.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert matches in their sessions" 
  ON public.matches FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE id = session_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update matches in their sessions" 
  ON public.matches FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = matches.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete matches in their sessions" 
  ON public.matches FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = matches.session_id 
      AND sessions.created_by = auth.uid()
    )
  );

-- Match players policies
DROP POLICY IF EXISTS "Users can view match players in their sessions" ON public.match_players;
DROP POLICY IF EXISTS "Users can insert match players in their sessions" ON public.match_players;
DROP POLICY IF EXISTS "Users can update match players in their sessions" ON public.match_players;
DROP POLICY IF EXISTS "Users can delete match players in their sessions" ON public.match_players;

CREATE POLICY "Users can view match players in their sessions" 
  ON public.match_players FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      JOIN sessions ON sessions.id = matches.session_id
      WHERE matches.id = match_players.match_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert match players in their sessions" 
  ON public.match_players FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches 
      JOIN sessions ON sessions.id = matches.session_id
      WHERE matches.id = match_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update match players in their sessions" 
  ON public.match_players FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      JOIN sessions ON sessions.id = matches.session_id
      WHERE matches.id = match_players.match_id 
      AND sessions.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete match players in their sessions" 
  ON public.match_players FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      JOIN sessions ON sessions.id = matches.session_id
      WHERE matches.id = match_players.match_id 
      AND sessions.created_by = auth.uid()
    )
  );

-- ============================================================================
-- 5. HELPER FUNCTIONS (Optional but useful)
-- ============================================================================

-- Function to get active session for current user
CREATE OR REPLACE FUNCTION get_active_session()
RETURNS TABLE (
  id UUID,
  name TEXT,
  court_count INTEGER,
  randomness_level FLOAT,
  current_round INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.court_count,
    s.randomness_level,
    s.current_round,
    s.status,
    s.created_at
  FROM public.sessions s
  WHERE s.created_by = auth.uid()
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_active_session() TO authenticated;

COMMENT ON FUNCTION get_active_session() IS 'Returns the most recent active session for the current user';
