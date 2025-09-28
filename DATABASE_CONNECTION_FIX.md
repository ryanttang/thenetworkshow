# Database Connection Fix

## Issue: Database Connection Failed

The health endpoint shows:
```
"database": {
  "status": "disconnected",
  "error": "Can't reach database server at `db.clkeqhnekidbxzzhmoeb.supabase.co:5432`"
}
```

## Root Cause

The Supabase database is not accessible. This could be due to:

1. **Database paused** (Supabase free tier pauses after inactivity)
2. **Incorrect connection string**
3. **Database not created**
4. **Network/firewall issues**

## Solutions

### Option 1: Wake up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. If the database is paused, click "Resume" or "Unpause"
4. Wait for the database to start (usually 1-2 minutes)

### Option 2: Check Connection String

1. In Supabase Dashboard → Settings → Database
2. Copy the correct connection string
3. Update `DATABASE_URL` in Vercel with the correct string

**Correct format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.clkeqhnekidbxzzhmoeb.supabase.co:5432/postgres
```

### Option 3: Create New Database

If the database doesn't exist:

1. Create a new Supabase project
2. Get the connection string
3. Update `DATABASE_URL` in Vercel
4. Run database migrations

## Steps to Fix

### 1. Check Supabase Dashboard
- Go to your Supabase project
- Check if database is running
- If paused, resume it

### 2. Update Vercel Environment Variables
- Go to Vercel → Settings → Environment Variables
- Update `DATABASE_URL` with correct connection string
- Make sure password is correct

### 3. Test Connection
```bash
curl https://thcmembersonly.vercel.app/api/health
```

### 4. Apply Database Schema
Once connected, apply the database schema:
```sql
-- Run this in Supabase SQL Editor
-- Copy contents from database/migrations/enable_rls_policies.sql
```

## Alternative: Use Different Database

If Supabase continues to have issues, you can use:

1. **Neon** (free PostgreSQL)
2. **Railway** (free PostgreSQL)
3. **PlanetScale** (MySQL)
4. **Local PostgreSQL** (for development)

## Verification

After fixing the database connection:

1. Health endpoint should show: `"database": {"status": "connected"}`
2. Authentication should work
3. Demo accounts should sign in successfully

## Demo Accounts

Once database is connected and seeded:
- `admin@example.com / admin123!`
- `organizer@example.com / organizer123!`

## Next Steps

1. **Check Supabase dashboard** (most likely solution)
2. **Resume database if paused**
3. **Update connection string if needed**
4. **Test health endpoint**
5. **Try authentication**
