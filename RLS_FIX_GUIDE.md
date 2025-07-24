# 🚨 RLS Policy Fix Guide

## Problem
**Error:** `new row violates row-level security policy for table "sacco_groups"`

This error occurs when trying to create SACCO groups because the Row Level Security (RLS) policies are either missing, incorrect, or causing recursion.

## Solution

### Step 1: Apply the SQL Fix
1. **Open Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content** from `fix-rls-policies.sql`
4. **Click "Run"**
5. **Verify you see:** `✅ RLS Policy Fix Complete! SACCO group creation should now work.`

### Step 2: Test SACCO Creation
1. **Go to your application** 
2. **Navigate to SACCO Groups page**
3. **Click "Create New Group"**
4. **Fill out the form and submit**
5. **Should work without errors** ✅

## What the Fix Does

### 🔧 **Policy Fixes:**
- ✅ **Removes conflicting policies** that cause recursion
- ✅ **Creates security definer functions** to prevent RLS loops  
- ✅ **Adds proper INSERT policy** for authenticated users
- ✅ **Maintains security** while enabling functionality

### 🎯 **Key Policy Changes:**
```sql
-- CRITICAL: This policy allows SACCO group creation
CREATE POLICY "sacco_create_authenticated" ON public.sacco_groups
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
);
```

### 🛡️ **Security Maintained:**
- Users can only create groups where they are the creator
- Users can only update their own groups
- Admins can manage all groups
- All users can view all groups (as intended for SACCO)

## Alternative Quick Fix (If SQL Script Doesn't Work)

If the main script doesn't work, try this simpler approach:

### Option A: Temporarily Disable RLS
```sql
-- TEMPORARY: Disable RLS on sacco_groups (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE public.sacco_groups DISABLE ROW LEVEL SECURITY;
```

### Option B: Create Minimal Policy
```sql
-- Create a simple policy that allows all authenticated users
CREATE POLICY "allow_all_authenticated" ON public.sacco_groups
FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## Verification Commands

After applying the fix, run these to verify:

```sql
-- Check if policies exist
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'sacco_groups';

-- Test user authentication
SELECT auth.uid(), auth.email();

-- Check user exists
SELECT id, email, role FROM public.users WHERE id = auth.uid();
```

## Common Issues & Solutions

### Issue 1: "Function auth.uid() does not exist"
**Solution:** Make sure you're running this in Supabase, not a local database.

### Issue 2: "User not found in users table"
**Solution:** The script automatically creates a user record, but you can manually insert:
```sql
INSERT INTO public.users (id, email, first_name, last_name, role) 
VALUES (auth.uid(), auth.email(), 'First', 'Last', 'member');
```

### Issue 3: Still getting RLS errors
**Solution:** Try the alternative quick fixes above, or temporarily disable RLS for testing.

## Files Modified
- ✅ `fix-rls-policies.sql` - Complete SQL fix script
- ✅ `RLS_FIX_GUIDE.md` - This documentation

## Next Steps
1. **Apply the SQL fix**
2. **Test SACCO group creation**
3. **If it works:** You're done! ✅
4. **If it doesn't work:** Try the alternative fixes above
5. **Re-enable middleware** in `src/middleware.ts` once everything works

## Need Help?
- Check Supabase logs for detailed error messages
- Verify user authentication in browser dev tools
- Test with a simple SACCO group creation first
