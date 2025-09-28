# 🚨 URGENT: Database Connection Fix

## Current Status
- ❌ **Database**: Disconnected
- ❌ **Authentication**: 401 Unauthorized
- ❌ **Health Check**: Unhealthy

## Immediate Action Required

### Step 1: Check Supabase Dashboard
1. **Go to**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Find your project** (look for `thcmembersonly` or similar)
3. **Check the status** - is it "Paused" or "Active"?

### Step 2A: If Database is Paused
1. **Click "Resume"** or "Unpause"
2. **Wait 2-3 minutes** for database to start
3. **Status should change to "Active"**

### Step 2B: If Database is Active
1. **Go to Settings → Database**
2. **Copy the Connection string** (not URI)
3. **Format should be**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.clkeqhnekidbxzzhmoeb.supabase.co:5432/postgres
   ```

### Step 3: Update Vercel Environment Variables
1. **Go to**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Select your project**: `thcmembersonly`
3. **Go to**: Settings → Environment Variables
4. **Update `DATABASE_URL`** with the correct connection string
5. **Make sure password is included**

### Step 4: Redeploy
1. **Go to**: Deployments tab
2. **Click "Redeploy"** on latest deployment
3. **Or push a new commit** to trigger redeploy

## Alternative: Create New Supabase Project

If the current project has issues:

### Quick Setup
1. **Create new project** at [supabase.com](https://supabase.com)
2. **Name**: `thcmembersonly-prod`
3. **Set password** (remember this!)
4. **Choose region** (closest to your users)

### Get Connection String
1. **Settings → Database → Connection string**
2. **Copy the full string**
3. **Format**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Update Vercel
1. **Set `DATABASE_URL`** to new connection string
2. **Redeploy application**

### Apply Database Schema
1. **Go to SQL Editor** in Supabase
2. **Run this SQL**:
   ```sql
   -- Enable Row Level Security (RLS) for all public tables
   ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."Image" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."Gallery" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."GalleryImage" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."Coordination" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."CoordinationDocument" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "public"."InstagramAccount" ENABLE ROW LEVEL SECURITY;
   ```

## Verification Steps

### 1. Check Health Endpoint
```bash
curl https://thcmembersonly.vercel.app/api/health
```

**Should return**:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected"
  }
}
```

### 2. Test Authentication
- **Go to**: [https://thcmembersonly.vercel.app/signin](https://thcmembersonly.vercel.app/signin)
- **Try signing in** with demo accounts
- **Should work without 401 errors**

## Demo Accounts (after database is connected)
- `admin@example.com / admin123!`
- `organizer@example.com / organizer123!`

## Common Issues & Solutions

### "Can't reach database server"
- **Cause**: Database paused or wrong connection string
- **Solution**: Resume database or update connection string

### "Authentication failed"
- **Cause**: Database not connected
- **Solution**: Fix database connection first

### "Invalid password"
- **Cause**: Wrong password in connection string
- **Solution**: Get correct password from Supabase dashboard

## Most Likely Solution
**The Supabase database is paused**. Resume it in the Supabase dashboard.

## Next Steps
1. **Check Supabase dashboard** (most likely solution)
2. **Resume database if paused**
3. **Update DATABASE_URL in Vercel**
4. **Redeploy application**
5. **Test authentication**

## Quick Test
After fixing, test with:
```bash
curl https://thcmembersonly.vercel.app/api/health
```

Should return healthy status with connected database.
