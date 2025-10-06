# Admin & Organizer User Creation Guide

This guide will help you create admin and organizer login credentials for The Network Show application with your new Supabase setup.

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Set up your environment:**
   ```bash
   ./scripts/setup-env.sh
   ```
   This will prompt you for your Supabase project details and create a `.env` file.

2. **Sync your database schema:**
   ```bash
   npm run db:push
   ```

3. **Create admin and organizer users:**
   ```bash
   node scripts/create-admin-organizer-users.js
   ```

### Option 2: Manual Setup

1. **Create your `.env` file** with your Supabase DATABASE_URL:
   ```bash
   cp env.thenetworkshow.example .env
   # Edit .env with your Supabase credentials
   ```

2. **Sync your database schema:**
   ```bash
   npm run db:push
   ```

3. **Create users using the existing seed script:**
   ```bash
   npm run db:seed
   ```

## Default Credentials

If you use the automated setup or seed script, you'll get these default credentials:

### Admin User
- **Email:** `admin@example.com`
- **Password:** `Admin123!@#`
- **Role:** `NETWORK_ADMIN`
- **Permissions:** Full access to all features, user management, system settings

### Organizer User
- **Email:** `organizer@example.com`
- **Password:** `Organizer123!@#`
- **Role:** `ORGANIZER`
- **Permissions:** Create and manage events, upload images, manage galleries

## Custom Credentials

The `create-admin-organizer-users.js` script allows you to:
- Use default credentials (option 1)
- Enter custom email addresses and passwords (option 2)

## User Roles & Permissions

### NETWORK_ADMIN Role
- ✅ Full system access
- ✅ User management (create, edit, delete users)
- ✅ Event management (all events)
- ✅ Image and gallery management
- ✅ System configuration
- ✅ Access to admin dashboard

### ORGANIZER Role
- ✅ Create and manage their own events
- ✅ Upload and manage images
- ✅ Create and manage galleries
- ✅ Access to organizer dashboard
- ❌ Cannot manage other users
- ❌ Cannot access admin-only features

### VIEWER Role (Default)
- ✅ View published content
- ✅ Basic event interaction
- ❌ Cannot create or manage content

## Troubleshooting

### Database Connection Issues
If you get connection errors:
1. Verify your DATABASE_URL is correct
2. Check that your Supabase project is running
3. Ensure your database password is correct
4. Make sure your IP is whitelisted in Supabase (if using IP restrictions)

### User Creation Fails
If user creation fails:
1. Ensure the database schema is synced (`npm run db:push`)
2. Check that the User table exists
3. Verify your DATABASE_URL has the correct permissions

### Login Issues
If you can't log in:
1. Verify the user was created successfully
2. Check that the password was hashed correctly
3. Ensure NextAuth is properly configured
4. Check browser console for authentication errors

## Security Notes

- Default passwords are strong but should be changed in production
- Passwords are hashed using bcrypt with 12 rounds
- Users are created with proper role-based access control
- All authentication goes through NextAuth.js

## Next Steps

After creating users:
1. Test login at `http://localhost:3000/signin`
2. Access the dashboard at `http://localhost:3000/dashboard`
3. Create your first event as an organizer
4. Configure additional settings as an admin

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Supabase project configuration
3. Ensure all environment variables are properly set
4. Check the database connection and schema
