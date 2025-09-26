-- Step 1: Enable RLS on all tables
-- Run this first to enable Row Level Security

ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Image" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."GalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Coordination" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CoordinationDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."InstagramAccount" ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Event', 'Image', 'Gallery', 'GalleryImage', 'Coordination', 'CoordinationDocument', 'InstagramAccount');
