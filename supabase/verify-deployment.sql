-- Verification query to check all tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if all expected tables exist
SELECT 
  'users' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ Created' ELSE '❌ Missing' END as status
UNION ALL
SELECT 'sacco_groups', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sacco_groups') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'sacco_memberships', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sacco_memberships') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'transactions', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'loans', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loans') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'savings_accounts', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'savings_accounts') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'governance_proposals', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'governance_proposals') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'governance_votes', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'governance_votes') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'loan_defaults', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_defaults') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'audit_log', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'financial_education_content', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_education_content') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'user_learning_progress', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_learning_progress') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'system_monitoring', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_monitoring') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'security_events', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events') 
    THEN '✅ Created' ELSE '❌ Missing' END
UNION ALL
SELECT 'system_notifications', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_notifications') 
    THEN '✅ Created' ELSE '❌ Missing' END;
