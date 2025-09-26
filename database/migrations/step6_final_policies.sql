-- Step 6: CoordinationDocument and Instagram policies
-- Run this after Step 5

-- CoordinationDocument policies
CREATE POLICY "Anyone can view coordination documents" ON "public"."CoordinationDocument"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" 
            WHERE "Coordination".id = "CoordinationDocument"."coordinationId" 
            AND "Coordination"."isActive" = true
        )
    );

CREATE POLICY "Event owners can view own coordination documents" ON "public"."CoordinationDocument"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" c
            JOIN "public"."Event" e ON e.id = c."eventId"
            WHERE c.id = "CoordinationDocument"."coordinationId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can update own coordination documents" ON "public"."CoordinationDocument"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" c
            JOIN "public"."Event" e ON e.id = c."eventId"
            WHERE c.id = "CoordinationDocument"."coordinationId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can delete own coordination documents" ON "public"."CoordinationDocument"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" c
            JOIN "public"."Event" e ON e.id = c."eventId"
            WHERE c.id = "CoordinationDocument"."coordinationId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

CREATE POLICY "Event owners can create coordination documents" ON "public"."CoordinationDocument"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" c
            JOIN "public"."Event" e ON e.id = c."eventId"
            WHERE c.id = "CoordinationDocument"."coordinationId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

-- InstagramAccount policies
CREATE POLICY "Users can view own Instagram accounts" ON "public"."InstagramAccount"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own Instagram accounts" ON "public"."InstagramAccount"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own Instagram accounts" ON "public"."InstagramAccount"
    FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Authenticated users can connect Instagram accounts" ON "public"."InstagramAccount"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- InstagramPost policies (if table exists)
CREATE POLICY "Anyone can view published Instagram posts" ON "public"."InstagramPost"
    FOR SELECT USING ("isPublished" = true);

CREATE POLICY "Account owners can view own Instagram posts" ON "public"."InstagramPost"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Account owners can update own Instagram posts" ON "public"."InstagramPost"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Account owners can delete own Instagram posts" ON "public"."InstagramPost"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Account owners can create Instagram posts" ON "public"."InstagramPost"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Test the policies
SELECT * FROM "public"."CoordinationDocument" LIMIT 5;
SELECT * FROM "public"."InstagramAccount" WHERE "userId" = auth.uid()::text;
SELECT * FROM "public"."InstagramPost" WHERE "isPublished" = true LIMIT 5;
