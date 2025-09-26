-- Step 3: Event table policies
-- Run this after Step 2

-- Anyone can view published events
CREATE POLICY "Anyone can view published events" ON "public"."Event"
    FOR SELECT USING (status = 'PUBLISHED');

-- Event owners can view/edit their own events
CREATE POLICY "Event owners can view own events" ON "public"."Event"
    FOR SELECT USING (auth.uid()::text = "ownerId");

CREATE POLICY "Event owners can update own events" ON "public"."Event"
    FOR UPDATE USING (auth.uid()::text = "ownerId");

CREATE POLICY "Event owners can delete own events" ON "public"."Event"
    FOR DELETE USING (auth.uid()::text = "ownerId");

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON "public"."Event"
    FOR INSERT WITH CHECK (auth.uid()::text = "ownerId");

-- Test the policies
-- This should return published events and user's own events
SELECT * FROM "public"."Event" WHERE status = 'PUBLISHED' OR "ownerId" = auth.uid()::text;
