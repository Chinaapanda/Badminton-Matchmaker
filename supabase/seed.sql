-- Seed data for local development
-- After running this seed:
-- 1. Register a new account with email: admin@local.dev, password: admin123
-- 2. The profile will automatically be set to admin role

-- Note: You need to create accounts through the app's registration first
-- This seed file will be ready to grant admin privileges when those accounts are created

-- Instructions for creating admin account:
-- 1. Start the app: pnpm dev
-- 2. Go to http://localhost:3000/register
-- 3. Register with email: admin@local.dev, password: admin123
-- 4. The account will be created as 'user' role by default
-- 5. Run this SQL manually in Supabase Studio to make it admin:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@local.dev';

-- Or use this approach: Create sample players for testing
INSERT INTO public.players (name, elo, wins, losses)
VALUES 
  ('Alice', 1300, 5, 2),
  ('Bob', 1250, 3, 3),
  ('Charlie', 1200, 2, 4),
  ('Diana', 1350, 6, 1),
  ('Eve', 1180, 1, 5),
  ('Frank', 1220, 4, 3)
ON CONFLICT DO NOTHING;

