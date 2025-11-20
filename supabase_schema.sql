-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES: Linked to auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  display_name text,
  elo integer default 1200,
  wins integer default 0,
  losses integer default 0,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SESSIONS: Represents a game day/event
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  court_count integer default 1,
  randomness_level float default 0.5,
  is_active boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SESSION_PLAYERS: Who is checked in to a session
create table public.session_players (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  player_id uuid references public.profiles(id) on delete cascade,
  is_active boolean default true, -- If they are currently ready to play
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(session_id, player_id)
);

-- MATCHES: Record of games
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  court_number integer,
  winner_team integer, -- 1 or 2
  score text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  finished_at timestamp with time zone
);

-- MATCH_PLAYERS: Who played in which match
create table public.match_players (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) on delete cascade,
  player_id uuid references public.profiles(id) on delete cascade,
  team integer, -- 1 or 2
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;

-- Allow public read access for now (simplifies development)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Sessions are viewable by everyone" on public.sessions for select using (true);
create policy "Authenticated users can create sessions" on public.sessions for insert with check (auth.role() = 'authenticated');
create policy "Creators can update sessions" on public.sessions for update using (auth.uid() = created_by);

create policy "Session players viewable by everyone" on public.session_players for select using (true);
create policy "Authenticated users can join sessions" on public.session_players for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own status" on public.session_players for update using (auth.uid() = player_id);

create policy "Matches viewable by everyone" on public.matches for select using (true);
create policy "Authenticated users can create matches" on public.matches for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update matches" on public.matches for update using (auth.role() = 'authenticated');

create policy "Match players viewable by everyone" on public.match_players for select using (true);
create policy "Authenticated users can insert match players" on public.match_players for insert with check (auth.role() = 'authenticated');

-- TRIGGER: Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
