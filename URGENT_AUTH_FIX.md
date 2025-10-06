# 🚨 URGENT: Authentication 401 Error Fix

## Current Status
- ❌ **Database**: Disconnected (`db.fgdvfkgihheiuinxkzyg.supabase.co:5432`)
- ❌ **Authentication**: 401 Unauthorized on `/api/auth/callback/credentials`
- ❌ **Health Check**: Unhealthy

## Root Cause: PgBouncer + Database Connection Issue

The 401 error is caused by **TWO issues**:
1. **Database connection failure** (can't reach Supabase)
2. **PgBouncer configuration** (when database is connected)

## IMMEDIATE FIX REQUIRED

### Step 1: Fix Database Connection

**Option A: Resume Supabase Database**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find project with database `db.fgdvfkgihheiuinxkzyg.supabase.co`
3. **If paused**: Click "Resume" or "Unpause"
4. **Wait 2-3 minutes** for database to start

**Option B: Update Connection String**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the **Connection string** (not URI)
3. Update `DATABASE_URL` in Vercel with correct string

### Step 2: Fix PgBouncer Issue

**Update DATABASE_URL in Vercel to bypass pgbouncer:**

**Current (causing issues):**
```
postgresql://postgres:[password]@db.fgdvfkgihheiuinxkzyg.supabase.co:5432/postgres
```

**Fixed (bypasses pgbouncer):**
```
postgresql://postgres:[password]@db.fgdvfkgihheiuinxkzyg.supabase.co:5432/postgres?pgbouncer=false&sslmode=require
```

**Alternative (direct connection):**
```
postgresql://postgres:[password]@db.fgdvfkgihheiuinxkzyg.supabase.co:6543/postgres?sslmode=require
```

### Step 3: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `thenetworkshow`
3. Go to: Settings → Environment Variables
4. Find `DATABASE_URL` and update with the fixed connection string
5. **Make sure password is correct**
6. Click "Save"

### Step 4: Redeploy Application

1. Go to: Deployments tab
2. Click "Redeploy" on latest deployment
3. **Or push a new commit** to trigger redeploy

## Why This Fixes the 401 Error

### PgBouncer Issue:
- **Supabase uses pgbouncer** for connection pooling
- **NextAuth requires prepared statements** for user authentication
- **PgBouncer in transaction pooling mode** doesn't support prepared statements
- **Result**: Authentication fails with 401 Unauthorized

### Database Connection Issue:
- **Database is disconnected** (`Can't reach database server`)
- **NextAuth can't verify user credentials** without database access
- **Result**: Authentication fails with 401 Unauthorized

## Verification Steps

### 1. Check Health Endpoint
```bash
curl https://thenetworkshow.vercel.app/api/health
```

**Should return:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected"
  }
}
```

### 2. Test Authentication
1. Go to: [https://thenetworkshow.vercel.app/signin](https://thenetworkshow.vercel.app/signin)
2. Try signing in with demo credentials:
   - Email: `network_admin@example.com`
   - Password: `admin123!`
3. Should redirect to `/dashboard` on success
4. **No more 401 errors**

## Alternative Solutions

### If Supabase Database is Permanently Down:

**Create New Supabase Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `thenetworkshow-prod`
3. Set password (remember this!)
4. Get connection string
5. Update `DATABASE_URL` in Vercel
6. Apply database schema from `database/migrations/`

### If PgBouncer Issues Persist:

**Use Direct Connection Port:**
```
postgresql://postgres:[password]@db.fgdvfkgihheiuinxkzyg.supabase.co:6543/postgres?sslmode=require
```

**Note**: Port `6543` bypasses pgbouncer completely.

## Expected Results After Fix

- ✅ **Health endpoint**: Returns healthy status
- ✅ **Database**: Connected
- ✅ **Authentication**: Works without 401 errors
- ✅ **Sign-in**: Users can sign in successfully
- ✅ **Sessions**: Created and maintained properly

## Most Likely Solution

**The Supabase database is paused**. Resume it in the Supabase dashboard, then update the connection string to bypass pgbouncer.

## Quick Test After Fix

```bash
# Test health
curl https://thenetworkshow.vercel.app/api/health

# Test NextAuth config
curl https://thenetworkshow.vercel.app/api/debug/nextauth
```

Both should return successful responses with connected database.
