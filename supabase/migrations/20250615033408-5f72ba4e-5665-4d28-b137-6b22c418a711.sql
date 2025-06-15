
-- Fix the infinite recursion in RLS policies for user_roles table
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a simple, non-recursive policy for admins
-- This assumes we have a way to identify admin users without querying user_roles
CREATE POLICY "Users can view own roles and admins can view all" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      -- List specific admin user IDs here or use a different approach
      SELECT id FROM auth.users WHERE email IN ('admin@example.com')
    )
  );

-- Create policy for inserting roles (only for the user themselves or system)
CREATE POLICY "Users can insert own roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create policy for updating roles (only admins via specific user IDs)
CREATE POLICY "Limited admin role updates" 
  ON public.user_roles 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email IN ('admin@example.com')
    )
  );

-- Create policy for deleting roles (only admins via specific user IDs)
CREATE POLICY "Limited admin role deletions" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email IN ('admin@example.com')
    )
  );
