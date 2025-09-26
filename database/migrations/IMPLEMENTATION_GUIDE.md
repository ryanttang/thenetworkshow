# RLS Implementation Guide

## Quick Start

To fix the security linting errors, you need to enable Row Level Security (RLS) on your database tables. I've created step-by-step migration files to make this process easy and safe.

## Files Created

- `enable_rls_policies.sql` - Complete migration (run all at once)
- `step1_enable_rls.sql` through `step7_verification.sql` - Step-by-step approach
- `RLS_README.md` - Detailed documentation

## Recommended Approach: Step-by-Step

1. **Step 1**: Enable RLS on all tables
   ```sql
   -- Run: step1_enable_rls.sql
   ```

2. **Step 2**: User table policies
   ```sql
   -- Run: step2_user_policies.sql
   ```

3. **Step 3**: Event table policies
   ```sql
   -- Run: step3_event_policies.sql
   ```

4. **Step 4**: Image and Gallery policies
   ```sql
   -- Run: step4_image_gallery_policies.sql
   ```

5. **Step 5**: GalleryImage and Coordination policies
   ```sql
   -- Run: step5_galleryimage_coordination_policies.sql
   ```

6. **Step 6**: Final policies (CoordinationDocument, Instagram)
   ```sql
   -- Run: step6_final_policies.sql
   ```

7. **Step 7**: Verification
   ```sql
   -- Run: step7_verification.sql
   ```

## How to Apply

### Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each step file content
4. Run each step sequentially
5. Check the results after each step

### Using Supabase CLI
```bash
# Apply all steps at once
supabase db reset
# Then run the complete migration
psql -h your-db-host -U postgres -d postgres -f prisma/migrations/enable_rls_policies.sql
```

## What This Fixes

The RLS policies implement proper access control:

- **Public Access**: Published events, public galleries, published Instagram posts
- **User Access**: Users can only see/edit their own data
- **Event Owner Access**: Event owners can manage their events and related content
- **Gallery Access**: Public galleries visible to all, private galleries only to event owners

## Testing After Implementation

1. **Test as unauthenticated user**:
   - Should only see published events
   - Should only see public galleries
   - Should only see published Instagram posts

2. **Test as authenticated user**:
   - Should see their own profile
   - Should see their own events (draft and published)
   - Should see their own Instagram accounts

3. **Test as event owner**:
   - Should see their events and related galleries/coordination
   - Should be able to edit their content

## Troubleshooting

If you encounter issues:

1. **Check authentication**: Make sure `auth.uid()` returns the correct user ID
2. **Verify policies**: Use Step 7 verification queries to check policy status
3. **Test incrementally**: Run each step and test before proceeding
4. **Check logs**: Monitor Supabase logs for any policy violations

## Rollback (if needed)

If you need to rollback:

```sql
-- Disable RLS (NOT RECOMMENDED for production)
ALTER TABLE "public"."User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Event" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Image" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Gallery" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."GalleryImage" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Coordination" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CoordinationDocument" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."InstagramAccount" DISABLE ROW LEVEL SECURITY;
```

## Next Steps

After implementing RLS:

1. Test all application functionality thoroughly
2. Update your application code if needed to handle RLS restrictions
3. Consider adding admin policies for superuser access
4. Monitor for any access issues in production
5. Consider implementing role-based policies using your `Role` enum (ADMIN, ORGANIZER, VIEWER)

## Security Benefits

This implementation provides:

- ✅ Prevents unauthorized access to user data
- ✅ Ensures users can only see their own content
- ✅ Maintains public access to published content
- ✅ Protects sensitive coordination documents
- ✅ Secures Instagram account connections
- ✅ Follows Supabase security best practices
