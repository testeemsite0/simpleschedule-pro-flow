
-- Fix the RLS policy recursion issue by updating existing policies
-- First, ensure the security definer function exists and works properly
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop existing problematic RLS policies on user_roles if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Also create a helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_role text)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role::text = _role
  );
$$;
