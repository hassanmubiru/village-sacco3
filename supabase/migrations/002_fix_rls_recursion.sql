-- Fix infinite recursion in users table RLS policies
-- This migration fixes the circular dependency in admin role checking

-- First, drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.users;

-- Create a security definer function to check admin role without RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
$$;

-- Create a security definer function to check super admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND is_active = true
  );
$$;

-- Recreate ALL user policies using the security definer functions
-- Basic user policies
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow new user creation during registration (bypass RLS for INSERT)
CREATE POLICY "Allow user registration" ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Admin policies using security definer functions
CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update user profiles" ON public.users 
FOR UPDATE 
USING (public.is_admin());

-- Also fix any other policies that might have similar issues
DROP POLICY IF EXISTS "Admins can manage all SACCO groups" ON public.sacco_groups;

CREATE POLICY "Admins can manage all SACCO groups" ON public.sacco_groups 
FOR ALL 
USING (public.is_admin());

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Comment to explain the fix
COMMENT ON FUNCTION public.is_admin() IS 'Security definer function to check admin role without RLS recursion';
COMMENT ON FUNCTION public.is_super_admin() IS 'Security definer function to check super admin role without RLS recursion';
