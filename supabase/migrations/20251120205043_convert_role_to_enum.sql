-- Step 1: Drop policies that depend on the role column
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- Step 2: Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Step 3: Add a temporary column with ENUM type
ALTER TABLE public.profiles 
ADD COLUMN role_new user_role;

-- Step 4: Copy data from old column to new column with proper casting
UPDATE public.profiles 
SET role_new = role::user_role;

-- Step 5: Set default value and NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN role_new SET DEFAULT 'user'::user_role;

ALTER TABLE public.profiles 
ALTER COLUMN role_new SET NOT NULL;

-- Step 6: Drop the old column and its constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
DROP COLUMN role;

-- Step 7: Rename the new column to 'role'
ALTER TABLE public.profiles 
RENAME COLUMN role_new TO role;

-- Step 8: Recreate the policies with ENUM type
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);

CREATE POLICY "Admins can delete any profile" 
ON public.profiles FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
);
