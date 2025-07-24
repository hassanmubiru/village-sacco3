# 🔧 Fix for "Infinite recursion detected in policy for relation users"

## Problem
The RLS policies on the `users` table are causing infinite recursion because they query the same table they're protecting when checking admin roles.

## Solution
Run the following SQL in your Supabase SQL Editor to fix the issue:

```sql
-- Fix infinite recursion in users table RLS policies
-- This migration fixes the circular dependency in admin role checking

-- First, drop the problematic policies
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

-- Recreate admin policies using the security definer functions
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
```

## How to Apply:

1. **Go to your Supabase Dashboard**
2. **Navigate to**: SQL Editor
3. **Paste the above SQL** into a new query
4. **Run the query** by clicking "Run" or pressing Ctrl+Enter
5. **Verify**: The policies should now work without recursion errors

## What This Fixes:

- **Before**: Policies tried to query `users` table while protecting it → infinite recursion
- **After**: Uses `SECURITY DEFINER` functions that can bypass RLS to check roles safely

## Test After Fix:

Try accessing your admin setup page again:
```
http://localhost:3000/setup/admin
```

The infinite recursion error should be resolved!
