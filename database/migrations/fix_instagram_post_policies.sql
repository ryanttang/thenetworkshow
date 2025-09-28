-- Fix InstagramPost multiple permissive policies
-- This consolidates overlapping SELECT policies for better performance

-- Drop existing InstagramPost policies
DROP POLICY IF EXISTS "Anyone can view published Instagram posts" ON "public"."InstagramPost";
DROP POLICY IF EXISTS "Account owners can view own Instagram posts" ON "public"."InstagramPost";
DROP POLICY IF EXISTS "Account owners can update own Instagram posts" ON "public"."InstagramPost";
DROP POLICY IF EXISTS "Account owners can delete own Instagram posts" ON "public"."InstagramPost";
DROP POLICY IF EXISTS "Account owners can create Instagram posts" ON "public"."InstagramPost";

-- Create consolidated policies
-- Single SELECT policy that covers both published posts and owner's posts
CREATE POLICY "View published posts or own posts" ON "public"."InstagramPost"
    FOR SELECT USING (
        "isPublished" = true 
        OR EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Account owners can update their own posts
CREATE POLICY "Account owners can update own posts" ON "public"."InstagramPost"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Account owners can delete their own posts
CREATE POLICY "Account owners can delete own posts" ON "public"."InstagramPost"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Account owners can create posts
CREATE POLICY "Account owners can create posts" ON "public"."InstagramPost"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'InstagramPost'
ORDER BY policyname;
