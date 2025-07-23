# 🚀 Deploy Village SACCO Database to Supabase

## 📊 Database Statistics
- **Tables**: 15 tables
- **Views**: 7 views  
- **Functions**: 11 functions
- **File Size**: 58KB (1,468 lines)
- **Location**: `supabase/migrations/001_initial_schema.sql`

## 🌐 Method 1: Manual Deployment (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Create a new project or select existing one

### Step 2: Open SQL Editor
1. In your project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### Step 3: Copy and Paste Schema
1. Open the file: `supabase/migrations/001_initial_schema.sql`
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

### Step 4: Verify Deployment
Run this verification query in SQL Editor:
```sql
-- Quick verification query
SELECT 
  'users' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ Created' ELSE '❌ Missing' END as status
UNION ALL
SELECT 'sacco_groups', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sacco_groups') 
    THEN '✅ Created' ELSE '❌ Missing' END
-- Add more tables as needed...
;
```

## 🔗 Method 2: CLI Deployment

### Prerequisites
- Docker Desktop installed and running
- Access to your Supabase project

### Commands
```bash
# 1. Link to your remote project
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Push the database schema
npx supabase db push

# 3. Verify deployment
npx supabase db diff
```

## 🔑 Get Your Project Credentials

After deployment, get these from **Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

Update your `.env.local` file with these values.

## ✅ Post-Deployment Checklist

- [ ] All 15 tables created
- [ ] All 7 views created  
- [ ] All 11 functions created
- [ ] RLS policies applied
- [ ] Environment variables updated
- [ ] Database connection tested

## 🧪 Test Database Connection

```typescript
// Test in your Next.js app
import { supabase } from './src/lib/supabase'

const testConnection = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  console.log('Database:', error ? 'Connection Failed' : 'Connected ✅')
}
```

## 🛠️ Troubleshooting

### Common Issues:
1. **RLS Policy Errors**: Disable RLS temporarily if needed
2. **JSON_OBJECT Errors**: Use the fix in `supabase/fix-json-object.sql`
3. **Permission Issues**: Make sure you're project owner/admin

### Support Files:
- `supabase/verify-deployment.sql` - Verification queries
- `supabase/fix-json-object.sql` - JSON function fix
- `.env.local.example` - Environment template

---

**Ready to deploy! 🎉**

Choose Method 1 (Manual) for the quickest deployment or Method 2 (CLI) for automated deployment.
