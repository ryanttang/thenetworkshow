-- Step 4: Image and Gallery policies
-- Run this after Step 3

-- Image policies
CREATE POLICY "Anyone can view images" ON "public"."Image"
    FOR SELECT USING (true);

CREATE POLICY "Image uploaders can update own images" ON "public"."Image"
    FOR UPDATE USING (auth.uid()::text = "uploaderId");

CREATE POLICY "Image uploaders can delete own images" ON "public"."Image"
    FOR DELETE USING (auth.uid()::text = "uploaderId");

CREATE POLICY "Authenticated users can upload images" ON "public"."Image"
    FOR INSERT WITH CHECK (auth.uid()::text = "uploaderId");

-- Gallery policies
CREATE POLICY "Anyone can view public galleries" ON "public"."Gallery"
    FOR SELECT USING ("isPublic" = true);

CREATE POLICY "Gallery creators can view own galleries" ON "public"."Gallery"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Gallery"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Gallery creators can update own galleries" ON "public"."Gallery"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Gallery"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Gallery creators can delete own galleries" ON "public"."Gallery"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Gallery"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can create galleries" ON "public"."Gallery"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Gallery"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

-- Test the policies
SELECT * FROM "public"."Image" LIMIT 5;
SELECT * FROM "public"."Gallery" WHERE "isPublic" = true LIMIT 5;
