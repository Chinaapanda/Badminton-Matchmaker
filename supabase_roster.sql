-- Create a table for players that are managed by users (rosters)
-- This is distinct from 'profiles' which are for authenticated users themselves.

create table public.players (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  elo integer default 1200,
  wins integer default 0,
  losses integer default 0,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.players enable row level security;

-- Policies
create policy "Players are viewable by everyone" on public.players for select using (true);

create policy "Users can insert their own players" on public.players for insert with check (auth.uid() = created_by);

create policy "Users can update their own players" on public.players for update using (auth.uid() = created_by);

create policy "Users can delete their own players" on public.players for delete using (auth.uid() = created_by);
