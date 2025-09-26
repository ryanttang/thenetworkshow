-- Step 2: User table policies
-- Run this after Step 1

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON "public"."User"
    FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "public"."User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Only authenticated users can insert (sign up)
CREATE POLICY "Authenticated users can insert" ON "public"."User"
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Test the policies
-- This should only return the current user's data
SELECT * FROM "public"."User" WHERE id = auth.uid()::text;
