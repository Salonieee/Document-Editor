-- Database Health Check Script
-- Run this to verify your database setup is working correctly

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Check if all tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'documents', 'document_permissions', 'document_versions', 'active_collaborators');
    
    IF table_count = 5 THEN
        RAISE NOTICE '✅ All required tables exist';
    ELSE
        RAISE NOTICE '❌ Missing tables. Expected 5, found %', table_count;
    END IF;
    
    -- Check RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    IF policy_count >= 10 THEN
        RAISE NOTICE '✅ RLS policies are configured (% policies found)', policy_count;
    ELSE
        RAISE NOTICE '⚠️  Few RLS policies found (% policies). This might cause permission issues.', policy_count;
    END IF;
    
    -- Check triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name = 'on_auth_user_created';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ User creation trigger is active';
    ELSE
        RAISE NOTICE '❌ User creation trigger is missing';
    END IF;
    
    -- Test basic functionality
    RAISE NOTICE '🧪 Testing basic queries...';
    
    -- Test profiles table
    PERFORM * FROM profiles LIMIT 1;
    RAISE NOTICE '✅ Profiles table is accessible';
    
    -- Test documents table
    PERFORM * FROM documents LIMIT 1;
    RAISE NOTICE '✅ Documents table is accessible';
    
    RAISE NOTICE '🎉 Database health check completed!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Health check failed: %', SQLERRM;
END $$;

-- Show table information
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as "Policy Count"
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'documents', 'document_permissions', 'document_versions', 'active_collaborators')
ORDER BY tablename;
