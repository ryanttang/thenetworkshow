# Authentication 401 Error Fix - PgBouncer Issue

## Problem
The 401 Unauthorized error on `/api/auth/callback/credentials` is caused by Supabase's pgbouncer connection pooling conflicting with NextAuth's authentication requirements.

## Root Cause
- **Supabase uses pgbouncer** for connection pooling
- **NextAuth requires prepared statements** for user authentication  
- **PgBouncer in transaction pooling mode** doesn't support prepared statements
- **Result**: Authentication fails with 401 Unauthorized

## Fix Applied

### 1. Updated Prisma Configuration
Modified `src/lib/prisma.ts` to include connection timeout settings for better pgbouncer compatibility:

```typescript
return new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // Add connection pooling configuration for Supabase pgbouncer compatibility
  __internal: {
    engine: {
      connectTimeout: 60000,
      queryTimeout: 60000,
    },
  },
});
```

### 2. Updated Environment Configuration
Updated `env.example` and `env.production.example` to include pgbouncer bypass:

**Before:**
```
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres?schema=public"
```

**After:**
```
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres?pgbouncer=false&sslmode=require"
```

## Required Action for Production

### Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `thenetworkshow`
3. Go to: Settings → Environment Variables
4. Update `DATABASE_URL` to include `?pgbouncer=false&sslmode=require`
5. Redeploy the application

### Alternative: Use Direct Connection Port
If the above doesn't work, use port 6543 (direct connection):

```
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:6543/postgres?sslmode=require"
```

## Testing

Run the test script to verify the fix:
```bash
node test-auth-fix.js
```

## Expected Results
- ✅ Health endpoint returns healthy status
- ✅ Database connection successful
- ✅ Authentication works without 401 errors
- ✅ Users can sign in successfully

## Files Modified
1. `src/lib/prisma.ts` - Added connection timeout configuration
2. `env.example` - Updated DATABASE_URL format
3. `env.production.example` - Updated DATABASE_URL format
4. `test-auth-fix.js` - Created verification script
5. `URGENT_AUTH_FIX.md` - Created comprehensive fix documentation
