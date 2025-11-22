-- Add profile_id column to players table to link players with profiles
-- This prevents the same profile from being added as a player multiple times

-- Add the profile_id column (nullable to allow guest players)
ALTER TABLE public.players 
ADD COLUMN profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add unique constraint to prevent duplicate players from the same profile
ALTER TABLE public.players 
ADD CONSTRAINT players_profile_id_unique UNIQUE (profile_id);

-- Create index for better query performance
CREATE INDEX idx_players_profile_id ON public.players(profile_id);

-- Update RLS policy to allow players with profile_id to be managed by that profile owner
CREATE POLICY "Profile owners can manage their linked players" 
ON public.players 
FOR ALL 
USING (
  profile_id IS NOT NULL AND auth.uid() = profile_id
);
