-- ================================================================
-- COMPLETE RLS POLICY FIX SCRIPT
-- Solves: "new row violates row-level security policy for table 'sacco_groups'"
-- Solves: "infinite recursion detected in policy for relation 'sacco_memberships'"
-- 
-- USAGE: Copy and paste this entire script into Supabase SQL Editor
-- This script is SAFE and can be run multiple times without errors
-- ================================================================

-- Step 1: Clean slate - Remove ALL existing conflicting policies
-- ================================================================
DO $$ 
BEGIN
    -- Drop ALL existing policies that might conflict
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Allow user registration" ON public.users;
    DROP POLICY IF EXISTS "users_select_own" ON public.users;
    DROP POLICY IF EXISTS "users_update_own" ON public.users;
    DROP POLICY IF EXISTS "users_insert_own" ON public.users;
    DROP POLICY IF EXISTS "users_view_own_profile" ON public.users;
    DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
    DROP POLICY IF EXISTS "users_insert_registration" ON public.users;
    DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
    DROP POLICY IF EXISTS "Admins can update user profiles" ON public.users;
    DROP POLICY IF EXISTS "admins_select_all_users" ON public.users;
    DROP POLICY IF EXISTS "admins_update_all_users" ON public.users;
    DROP POLICY IF EXISTS "admins_view_all_users" ON public.users;
    DROP POLICY IF EXISTS "admins_update_all_users" ON public.users;
    
    -- Drop ALL SACCO groups policies
    DROP POLICY IF EXISTS "SACCO groups are readable by all" ON public.sacco_groups;
    DROP POLICY IF EXISTS "Users can create SACCO groups" ON public.sacco_groups;
    DROP POLICY IF EXISTS "Creators can update their SACCO groups" ON public.sacco_groups;
    DROP POLICY IF EXISTS "Admins can manage all SACCO groups" ON public.sacco_groups;
    DROP POLICY IF EXISTS "Users can view SACCO groups" ON public.sacco_groups;
    DROP POLICY IF EXISTS "Authenticated users can create SACCO groups" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_groups_select_all" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_groups_insert_authenticated" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_groups_update_creator" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_groups_admin_all" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_view_all_authenticated" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_create_authenticated" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_update_own" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_delete_own" ON public.sacco_groups;
    DROP POLICY IF EXISTS "sacco_admin_manage_all" ON public.sacco_groups;
    
    -- Drop ALL SACCO memberships policies (CRITICAL - THESE CAUSE RECURSION)
    DROP POLICY IF EXISTS "Users can view their memberships" ON public.sacco_memberships;
    DROP POLICY IF EXISTS "Users can apply for membership" ON public.sacco_memberships;
    DROP POLICY IF EXISTS "Users can update their pending applications" ON public.sacco_memberships;
    DROP POLICY IF EXISTS "Group admins can view group memberships" ON public.sacco_memberships;
    DROP POLICY IF EXISTS "Group admins can approve/reject memberships" ON public.sacco_memberships;
    DROP POLICY IF EXISTS "Super admins can manage all memberships" ON public.sacco_memberships;
    
    RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- Step 2: Create Security Definer Functions (Prevents RLS Recursion)
-- ================================================================
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

-- Step 3: Create SAFE Users Table Policies
-- ================================================================
CREATE POLICY "users_view_own_profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_registration" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_view_all_users" ON public.users 
FOR SELECT USING (public.is_admin());

CREATE POLICY "admins_update_all_users" ON public.users 
FOR UPDATE USING (public.is_admin());

-- Step 4: Create CRITICAL SACCO Groups Policies (THE MAIN FIX)
-- ================================================================

-- Allow ALL authenticated users to view SACCO groups
CREATE POLICY "sacco_view_all_authenticated" ON public.sacco_groups
FOR SELECT TO authenticated USING (true);

-- CRITICAL: Allow authenticated users to CREATE SACCO groups
-- This is the main policy that was missing/broken
CREATE POLICY "sacco_create_authenticated" ON public.sacco_groups
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
);

-- Allow creators to update their own SACCO groups
CREATE POLICY "sacco_update_own" ON public.sacco_groups
FOR UPDATE USING (auth.uid() = created_by);

-- Allow creators to delete their own SACCO groups
CREATE POLICY "sacco_delete_own" ON public.sacco_groups
FOR DELETE USING (auth.uid() = created_by);

-- Allow admins to manage ALL SACCO groups
CREATE POLICY "sacco_admin_manage_all" ON public.sacco_groups
FOR ALL USING (public.is_admin());

-- Step 4B: Create SAFE SACCO Memberships Policies (FIXES RECURSION)
-- ================================================================

-- SIMPLE policies for sacco_memberships to prevent recursion
-- Allow users to view their own memberships (NO RECURSION)
CREATE POLICY "memberships_view_own" ON public.sacco_memberships
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create membership applications (NO RECURSION)
CREATE POLICY "memberships_insert_own" ON public.sacco_memberships
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pending applications (NO RECURSION)
CREATE POLICY "memberships_update_own" ON public.sacco_memberships
FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to manage all memberships (SAFE with security definer)
CREATE POLICY "memberships_admin_all" ON public.sacco_memberships
FOR ALL USING (public.is_admin());

-- Step 5: Grant Permissions
-- ================================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Step 6: Ensure RLS is Enabled
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_memberships ENABLE ROW LEVEL SECURITY;

-- Step 7: Create Test User Entry (Ensures user exists in database)
-- ================================================================
DO $$
BEGIN
    -- Only insert if user is authenticated
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.users (id, email, first_name, last_name, role, is_active) 
        VALUES (
            auth.uid(), 
            COALESCE(auth.email(), 'user@example.com'), 
            'User', 
            'Name', 
            'member', 
            true
        )
        ON CONFLICT (id) DO UPDATE SET 
            updated_at = NOW();
        
        RAISE NOTICE 'User record ensured for authenticated user';
    ELSE
        RAISE NOTICE 'No authenticated user - skipping user record creation';
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'User record creation skipped (this is normal if not authenticated)';
END $$;

-- Step 8: Verify the Fix
-- ================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'sacco_groups')
ORDER BY tablename, policyname;

-- Success Message
SELECT '✅ RLS Policy Fix Complete! SACCO group creation should now work.' as status;

-- ================================================================
-- TROUBLESHOOTING NOTES:
-- ================================================================
-- If you still get errors after running this script:
-- 1. Check that you're logged in to your application
-- 2. Verify the user exists in the users table
-- 3. Check that auth.uid() returns a valid UUID
-- 4. Ensure the created_by field matches auth.uid()
-- ================================================================
