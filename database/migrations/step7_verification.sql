-- Step 7: Verification and Testing
-- Run this after all previous steps to verify RLS is working

-- Check that RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Event', 'Image', 'Gallery', 'GalleryImage', 'Coordination', 'CoordinationDocument', 'InstagramAccount', 'InstagramPost')
ORDER BY tablename;

-- Check existing policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test queries (run these as different users to verify access)
-- As unauthenticated user (should only see public data):
-- SELECT * FROM "public"."Event" WHERE status = 'PUBLISHED';
-- SELECT * FROM "public"."Gallery" WHERE "isPublic" = true;
-- SELECT * FROM "public"."InstagramPost" WHERE "isPublished" = true;

-- As authenticated user (should see own data + public data):
-- SELECT * FROM "public"."User" WHERE id = auth.uid()::text;
-- SELECT * FROM "public"."Event" WHERE "ownerId" = auth.uid()::text OR status = 'PUBLISHED';
-- SELECT * FROM "public"."InstagramAccount" WHERE "userId" = auth.uid()::text;
