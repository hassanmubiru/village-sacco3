# 🚨 SAFE SQL FIX - Run This Instead

## Issue: 
- "policy already exists" errors
- Need to safely update RLS policies

## Solution:
Copy and paste this **SAFE** SQL into your **Supabase SQL Editor**:

```sql
-- Safe RLS Policy Fix - Handles existing policies gracefully
-- This script can be run multiple times safely

-- Drop ALL existing policies on users table (safe with IF EXISTS)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.users;

-- Create or replace security definer functions (safe)
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

-- Recreate ALL user policies (fresh start)
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can update user profiles" ON public.users 
FOR UPDATE 
USING (public.is_admin());

-- Fix SACCO groups policies too
DROP POLICY IF EXISTS "Admins can manage all SACCO groups" ON public.sacco_groups;

CREATE POLICY "Admins can manage all SACCO groups" ON public.sacco_groups 
FOR ALL 
USING (public.is_admin());

-- Grant permissions (safe - won't error if already granted)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.is_admin() IS 'Security definer function to check admin role without RLS recursion';
COMMENT ON FUNCTION public.is_super_admin() IS 'Security definer function to check super admin role without RLS recursion';
```

## 🚀 Steps:
1. **Copy the SQL above** (the entire block)
2. **Open Supabase Dashboard** → **SQL Editor**
3. **Paste and Run** - should complete without errors
4. **Look for "Success" message**

## ✅ This Version:
- ✅ Safely drops ALL existing policies first
- ✅ Won't error on duplicate policies
- ✅ Can be run multiple times safely
- ✅ Fixes the RLS recursion issue completely

## 🧪 After Running:
1. **Try logging in again**
2. **Check browser console** for debug messages
3. **Should redirect properly to dashboard/admin**

This version handles the "already exists" errors properly! 🎯
