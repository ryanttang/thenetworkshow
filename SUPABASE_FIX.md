# Supabase Database Fix

## Issue: Vercel Can't Connect to Supabase

**Local database**: ✅ Working (2 users, 13 tables)
**Vercel database**: ❌ Connection failed

## Root Cause

The Supabase database is likely **paused** or the connection string in Vercel is incorrect.

## Immediate Fix Steps

### 1. Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project: `thcmembersonly` or similar
3. **Look for "Paused" status** - this is the most common issue

### 2. Resume Database (if paused)
1. Click **"Resume"** or **"Unpause"** button
2. Wait 1-2 minutes for database to start
3. You should see "Active" status

### 3. Get Correct Connection String
1. In Supabase Dashboard → **Settings** → **Database**
2. Copy the **Connection string** (not the URI)
3. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.clkeqhnekidbxzzhmoeb.supabase.co:5432/postgres
   ```

### 4. Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Update `DATABASE_URL` with the correct connection string
4. **Make sure to include the password**

### 5. Redeploy
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger redeploy

## Alternative: Create New Supabase Project

If the current project has issues:

1. **Create new Supabase project**:
   - Go to [Supabase](https://supabase.com)
   - Click "New Project"
   - Choose organization
   - Name: `thcmembersonly-prod`
   - Set password
   - Choose region

2. **Get connection string**:
   - Settings → Database → Connection string
   - Copy the full string

3. **Update Vercel**:
   - Set `DATABASE_URL` to new connection string
   - Redeploy

4. **Apply database schema**:
   - Go to SQL Editor in Supabase
   - Run the contents of `database/migrations/enable_rls_policies.sql`

## Verification

After fixing:

1. **Check health endpoint**:
   ```bash
   curl https://thcmembersonly.vercel.app/api/health
   ```
   Should show: `"database": {"status": "connected"}`

2. **Test authentication**:
   - Try signing in with demo accounts
   - Should work without 401 errors

## Demo Accounts

Once database is connected:
- `admin@example.com / admin123!`
- `organizer@example.com / organizer123!`

## Common Issues

### "Can't reach database server"
- **Cause**: Database paused or wrong connection string
- **Solution**: Resume database or update connection string

### "Authentication failed"
- **Cause**: Database not connected
- **Solution**: Fix database connection first

### "Invalid password"
- **Cause**: Wrong password in connection string
- **Solution**: Get correct password from Supabase dashboard

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

Should return:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected"
  }
}
```
