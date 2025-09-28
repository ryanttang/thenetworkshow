# Vercel Database Connection Fix

## Issue
- ✅ **Local database**: Working (2 users, 13 tables)
- ❌ **Vercel database**: Still disconnected
- ✅ **Supabase database**: Active and upgraded

## Root Cause
The `DATABASE_URL` in Vercel is likely outdated or incorrect after the database upgrade.

## Step-by-Step Fix

### Step 1: Get Current Connection String
1. **Go to Supabase Dashboard** → Settings → Database
2. **Copy the Connection string** (not URI)
3. **Format should be**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.clkeqhnekidbxzzhmoeb.supabase.co:5432/postgres
   ```

### Step 2: Update Vercel Environment Variables
1. **Go to**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Select your project**: `thcmembersonly`
3. **Go to**: Settings → Environment Variables
4. **Find `DATABASE_URL`** and click the edit icon
5. **Update the value** with the current connection string
6. **Make sure password is correct**
7. **Click "Save"**

### Step 3: Redeploy Application
1. **Go to**: Deployments tab
2. **Click "Redeploy"** on the latest deployment
3. **Or push a new commit** to trigger redeploy

### Step 4: Verify Fix
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

## Alternative: Force Redeploy

If updating the environment variable doesn't work:

### Method 1: Push Empty Commit
```bash
git commit --allow-empty -m "Force redeploy after database upgrade"
git push origin main
```

### Method 2: Manual Redeploy
1. **Go to Vercel Dashboard** → Deployments
2. **Click "Redeploy"** on latest deployment
3. **Wait for deployment to complete**

## Common Issues

### Connection String Format
Make sure your `DATABASE_URL` includes:
- **Protocol**: `postgresql://`
- **Username**: `postgres`
- **Password**: Your actual password
- **Host**: `db.clkeqhnekidbxzzhmoeb.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`

### Password Issues
- **Check password** in Supabase dashboard
- **Make sure it matches** what's in the connection string
- **No special characters** that need encoding

### Environment Variable Scope
- **Make sure** `DATABASE_URL` is set for "All Environments"
- **Or specifically** for "Production" environment

## Verification Steps

### 1. Check Health Endpoint
```bash
curl https://thcmembersonly.vercel.app/api/health
```

### 2. Test Authentication
- **Go to**: [https://thcmembersonly.vercel.app/signin](https://thcmembersonly.vercel.app/signin)
- **Try signing in** with demo accounts
- **Should work without 401 errors**

## Demo Accounts
- `admin@example.com / admin123!`
- `organizer@example.com / organizer123!`

## Next Steps
1. **Update `DATABASE_URL` in Vercel**
2. **Redeploy application**
3. **Test health endpoint**
4. **Test authentication**
5. **Verify all functionality**

## Quick Test
After fixing, test with:
```bash
curl https://thcmembersonly.vercel.app/api/health
```

Should return healthy status with connected database.
