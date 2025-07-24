# 🔧 QUICK USER ROLE FIX

## Check & Fix User Role in Supabase

### 1. **Check Your User's Role:**

1. **Go to Supabase Dashboard** → **Table Editor** → **`users` table**
2. **Find your user row** (search by email)
3. **Look at the `role` column** - what does it show?
   - If it's **NULL/empty** → This is the problem!
   - If it shows `'member'` → Should redirect to `/dashboard`
   - If it shows `'admin'` → Should redirect to `/admin`

### 2. **Fix the Role (if it's NULL/empty):**

**Option A: Update via Supabase Dashboard**
1. **Click on your user row** in the table
2. **Edit the `role` field**
3. **Set it to:** `member` (for regular user) or `admin` (for admin user)
4. **Save the changes**

**Option B: Update via SQL**
Run this in **Supabase SQL Editor**:
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'member' 
WHERE email = 'your-email@example.com';

-- Or set as admin:
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 3. **Test Login Again**
After setting the role:
1. **Clear browser cache/cookies**
2. **Try logging in again**
3. **Check console for debug messages**

## 🎯 This Should Fix It!
Most login redirect issues are caused by NULL/empty role values in the database.

Let me know what you see in your user's role column! 🕵️‍♂️
