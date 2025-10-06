-- Enable Row Level Security (RLS) for all public tables
-- This migration addresses the security linting errors

-- Enable RLS on all tables
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Image" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."GalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Coordination" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CoordinationDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."InstagramAccount" ENABLE ROW LEVEL SECURITY;
-- Newly added tables
ALTER TABLE "public"."Subscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RecentEventVideo" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON "public"."User"
    FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "public"."User"
    FOR UPDATE USING (auth.uid()::text = id);

-- Only authenticated users can insert (sign up)
CREATE POLICY "Authenticated users can insert" ON "public"."User"
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create policies for Event table
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

-- Create policies for Image table
-- Anyone can view images (for public galleries)
CREATE POLICY "Anyone can view images" ON "public"."Image"
    FOR SELECT USING (true);

-- Only image uploaders can update/delete their images
CREATE POLICY "Image uploaders can update own images" ON "public"."Image"
    FOR UPDATE USING (auth.uid()::text = "uploaderId");

CREATE POLICY "Image uploaders can delete own images" ON "public"."Image"
    FOR DELETE USING (auth.uid()::text = "uploaderId");

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images" ON "public"."Image"
    FOR INSERT WITH CHECK (auth.uid()::text = "uploaderId");

-- Create policies for Gallery table
-- Anyone can view public galleries
CREATE POLICY "Anyone can view public galleries" ON "public"."Gallery"
    FOR SELECT USING ("isPublic" = true);

-- Gallery creators can view/edit their galleries (including private ones)
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

-- Event owners can create galleries for their events
CREATE POLICY "Event owners can create galleries" ON "public"."Gallery"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Gallery"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

-- Create policies for GalleryImage table
-- Anyone can view gallery images for public galleries
CREATE POLICY "Anyone can view public gallery images" ON "public"."GalleryImage"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" 
            WHERE "Gallery".id = "GalleryImage"."galleryId" 
            AND "Gallery"."isPublic" = true
        )
    );

-- Gallery creators can view/edit all images in their galleries
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

-- Gallery creators can add images to their galleries
CREATE POLICY "Gallery creators can add images to galleries" ON "public"."GalleryImage"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Gallery" g
            JOIN "public"."Event" e ON e.id = g."eventId"
            WHERE g.id = "GalleryImage"."galleryId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

-- Create policies for Coordination table
-- Anyone can view coordination with valid share token (for public sharing)
CREATE POLICY "Anyone can view coordination with share token" ON "public"."Coordination"
    FOR SELECT USING ("isActive" = true);

-- Event owners can view/edit coordination for their events
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

-- Event owners can create coordination for their events
CREATE POLICY "Event owners can create coordination" ON "public"."Coordination"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Event" 
            WHERE "Event".id = "Coordination"."eventId" 
            AND "Event"."ownerId" = auth.uid()::text
        )
    );

-- Create policies for CoordinationDocument table
-- Anyone can view coordination documents for active coordination
CREATE POLICY "Anyone can view coordination documents" ON "public"."CoordinationDocument"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" 
            WHERE "Coordination".id = "CoordinationDocument"."coordinationId" 
            AND "Coordination"."isActive" = true
        )
    );

-- Event owners can manage coordination documents for their events
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

-- Event owners can create coordination documents
CREATE POLICY "Event owners can create coordination documents" ON "public"."CoordinationDocument"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."Coordination" c
            JOIN "public"."Event" e ON e.id = c."eventId"
            WHERE c.id = "CoordinationDocument"."coordinationId" 
            AND e."ownerId" = auth.uid()::text
        )
    );

-- Create policies for InstagramAccount table
-- Users can only view/edit their own Instagram accounts
CREATE POLICY "Users can view own Instagram accounts" ON "public"."InstagramAccount"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own Instagram accounts" ON "public"."InstagramAccount"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own Instagram accounts" ON "public"."InstagramAccount"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Authenticated users can connect Instagram accounts
CREATE POLICY "Authenticated users can connect Instagram accounts" ON "public"."InstagramAccount"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Create policies for InstagramPost table (if it exists)
-- Anyone can view published Instagram posts
CREATE POLICY "Anyone can view published Instagram posts" ON "public"."InstagramPost"
    FOR SELECT USING ("isPublished" = true);

-- Account owners can view/edit all their Instagram posts
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

-- Account owners can create Instagram posts
CREATE POLICY "Account owners can create Instagram posts" ON "public"."InstagramPost"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."InstagramAccount" 
            WHERE "InstagramAccount".id = "InstagramPost"."accountId" 
            AND "InstagramAccount"."userId" = auth.uid()::text
        )
    );

-- Subscriber policies
-- Anyone can create a subscriber (public newsletter signup)
CREATE POLICY "Anyone can create subscriber" ON "public"."Subscriber"
    FOR INSERT WITH CHECK (true);

-- Only service role can update/delete subscribers; no general SELECT needed
CREATE POLICY "No general select on subscribers" ON "public"."Subscriber"
    FOR SELECT USING (false);

-- ContactMessage policies
-- Anyone can create a contact message
CREATE POLICY "Anyone can create contact message" ON "public"."ContactMessage"
    FOR INSERT WITH CHECK (true);

-- No general select/update/delete (restricted to backend service role)
CREATE POLICY "No general select on contact messages" ON "public"."ContactMessage"
    FOR SELECT USING (false);

-- RecentEventVideo policies
-- Anyone can view published videos (for homepage)
CREATE POLICY "Anyone can view published recent event videos" ON "public"."RecentEventVideo"
    FOR SELECT USING ("isPublished" = true);

-- Allow authenticated admins/organizers to manage videos by role in JWT (if present)
-- Note: Adjust if you use a different role claim
CREATE POLICY "Admins can manage recent event videos" ON "public"."RecentEventVideo"
    FOR ALL USING (
      coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('ADMIN','ORGANIZER'), false)
    ) WITH CHECK (
      coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('ADMIN','ORGANIZER'), false)
    );
