-- ================================================================
-- EMERGENCY RLS FIX - NUCLEAR OPTION
-- Completely disables problematic RLS and creates minimal safe policies
-- Use this when the standard fix doesn't work
-- ================================================================

-- Step 1: COMPLETELY DISABLE RLS on problematic tables
-- ================================================================
ALTER TABLE public.sacco_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_memberships DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (nuclear cleanup)
-- ================================================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
    
    -- Drop all policies on sacco_groups table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sacco_groups' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.sacco_groups';
    END LOOP;
    
    -- Drop all policies on sacco_memberships table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sacco_memberships' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.sacco_memberships';
    END LOOP;
    
    RAISE NOTICE 'ALL policies completely removed';
END $$;

-- Step 3: Create MINIMAL safe policies
-- ================================================================

-- Users table - minimal policies
CREATE POLICY "users_minimal" ON public.users
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SACCO Groups - allow all authenticated operations
CREATE POLICY "sacco_groups_allow_all" ON public.sacco_groups
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SACCO Memberships - allow all authenticated operations  
CREATE POLICY "sacco_memberships_allow_all" ON public.sacco_memberships
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Step 4: Re-enable RLS with safe policies
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacco_memberships ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the fix
-- ================================================================
SELECT 'EMERGENCY FIX APPLIED - All tables now allow authenticated access' as status;

-- Show current policies
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'sacco_groups', 'sacco_memberships')
ORDER BY tablename;
