# Row Level Security (RLS) Implementation

This document explains how to implement Row Level Security (RLS) for your THC Members Only application to address the security linting errors.

## Overview

The security linting detected that RLS is not enabled on 8 tables in your `public` schema:
- `User`
- `Event` 
- `Image`
- `Gallery`
- `GalleryImage`
- `Coordination`
- `CoordinationDocument`
- `InstagramAccount`

## Security Model

The RLS policies implement the following access patterns:

### User Table
- Users can only view and update their own profile
- Authenticated users can create accounts (sign up)

### Event Table
- Anyone can view published events (public access)
- Event owners can view, edit, and delete their own events
- Authenticated users can create events

### Image Table
- Anyone can view images (for public galleries)
- Image uploaders can update and delete their own images
- Authenticated users can upload images

### Gallery Table
- Anyone can view public galleries
- Event owners can manage galleries for their events (including private galleries)

### GalleryImage Table
- Anyone can view images in public galleries
- Event owners can manage images in their galleries

### Coordination Table
- Anyone can view coordination with valid share tokens (for public sharing)
- Event owners can manage coordination for their events

### CoordinationDocument Table
- Anyone can view documents for active coordination
- Event owners can manage coordination documents for their events

### InstagramAccount Table
- Users can only manage their own Instagram accounts

### InstagramPost Table
- Anyone can view published Instagram posts
- Account owners can manage their Instagram posts

## How to Apply

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `enable_rls_policies.sql`
4. Run the migration

### Option 2: Using Supabase CLI
```bash
supabase db reset
# Then apply the migration
```

### Option 3: Using psql
```bash
psql -h your-db-host -U postgres -d postgres -f prisma/migrations/enable_rls_policies.sql
```

## Verification

After applying the migration, verify that RLS is enabled:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('User', 'Event', 'Image', 'Gallery', 'GalleryImage', 'Coordination', 'CoordinationDocument', 'InstagramAccount');
```

All tables should show `rowsecurity = true`.

## Testing

Test the policies by:

1. **As an unauthenticated user**: Should only see published events, public galleries, and published Instagram posts
2. **As a regular user**: Should see their own data plus public content
3. **As an event owner**: Should see their events and related data

## Important Notes

- The policies use `auth.uid()` which is Supabase's built-in function to get the current user ID
- Make sure your authentication is properly configured in Supabase
- Test thoroughly after applying to ensure your application still works correctly
- Consider adding admin policies if you need superuser access

## Troubleshooting

If you encounter issues:

1. Check that `auth.uid()` returns the correct user ID format
2. Verify that your authentication is working properly
3. Test policies individually using the Supabase dashboard
4. Check the Supabase logs for any policy violations

## Next Steps

After implementing RLS:

1. Test all application functionality
2. Update your application code if needed to handle RLS restrictions
3. Consider adding more granular policies based on user roles (ADMIN, ORGANIZER, VIEWER)
4. Monitor for any access issues in production
