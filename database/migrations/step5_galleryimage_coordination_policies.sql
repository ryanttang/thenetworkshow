-- Step 5: GalleryImage and Coordination policies
-- Run this after Step 4

-- GalleryImage policies
CREATE POLICY "Anyone can view public gallery images" ON "public"."GalleryImage"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" 
            WHERE "Gallery".id = "GalleryImage"."galleryId" 
            AND "Gallery"."isPublic" = true
        )
    );

CREATE POLICY "Gallery creators can view own gallery images" ON "public"."GalleryImage"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" g
            JOIN "public"."Event" e ON e.id = g."eventId"
            WHERE g.id = "GalleryImage"."galleryId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Gallery creators can update own gallery images" ON "public"."GalleryImage"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" g
            JOIN "public"."Event" e ON e.id = g."eventId"
            WHERE g.id = "GalleryImage"."galleryId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Gallery creators can delete own gallery images" ON "public"."GalleryImage"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" g
            JOIN "public"."Event" e ON e.id = g."eventId"
            WHERE g.id = "GalleryImage"."galleryId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Gallery creators can add images to galleries" ON "public"."GalleryImage"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" g
            JOIN "public"."Event" e ON e.id = g."eventId"
            WHERE g.id = "GalleryImage"."galleryId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

-- Coordination policies
CREATE POLICY "Anyone can view coordination with share token" ON "public"."Coordination"
    FOR SELECT USING ("isActive" = true);

CREATE POLICY "Event owners can view own coordination" ON "public"."Coordination"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Coordination"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can update own coordination" ON "public"."Coordination"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Coordination"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can delete own coordination" ON "public"."Coordination"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Coordination"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can create coordination" ON "public"."Coordination"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Coordination"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

-- Test the policies
SELECT * FROM "public"."GalleryImage" LIMIT 5;
SELECT * FROM "public"."Coordination" WHERE "isActive" = true LIMIT 5;
