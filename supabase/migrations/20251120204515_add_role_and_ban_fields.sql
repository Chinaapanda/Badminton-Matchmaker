-- เพิ่ม role และ is_banned columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text default 'user';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean default false;

-- Add constraint for role if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check CHECK (role in ('user', 'admin'));
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- เพิ่ม admin policies
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete any profile" 
ON public.profiles FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);