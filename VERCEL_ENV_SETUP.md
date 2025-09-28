# Vercel Environment Variables Setup

## Critical Issue: 401 Unauthorized Error

The authentication is failing because **environment variables are not set in Vercel**. This is causing the 401 Unauthorized error.

## Required Environment Variables

You **MUST** set these in your Vercel dashboard:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your project: `thcmembersonly`
3. Click **Settings** → **Environment Variables**

### 2. Add These Variables

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/eventsdb?schema=public"

# NextAuth (REQUIRED)
NEXTAUTH_URL="https://thcmembersonly.vercel.app"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"

# AWS S3 (REQUIRED)
AWS_REGION="us-west-2"
S3_BUCKET="thcmembersonlyclub"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_PUBLIC_BASE_URL="https://thcmembersonlyclub.s3.us-west-2.amazonaws.com"
```

## How to Get These Values

### 1. DATABASE_URL
- If using Supabase: Go to Settings → Database → Connection string
- If using other PostgreSQL: Format: `postgresql://username:password@host:port/database`

### 2. NEXTAUTH_SECRET
Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. AWS Credentials
- Go to AWS Console → IAM → Users
- Create a user with S3 permissions
- Generate access keys

## Steps to Fix

1. **Set environment variables in Vercel**
2. **Redeploy the application**
3. **Test authentication with demo accounts**

## Demo Accounts

After setting up the database:
- `admin@example.com / admin123!`
- `organizer@example.com / organizer123!`

## Verification

1. Check `/api/health` endpoint
2. Try signing in with demo accounts
3. Check Vercel function logs for errors

## Common Issues

### 401 Unauthorized
- **Cause**: Missing `DATABASE_URL` or `NEXTAUTH_SECRET`
- **Solution**: Set all required environment variables

### Database Connection Failed
- **Cause**: Invalid `DATABASE_URL`
- **Solution**: Verify database connection string

### S3 Upload Failed
- **Cause**: Missing AWS credentials
- **Solution**: Set AWS environment variables

## Next Steps

1. **Set environment variables** (most important)
2. **Redeploy application**
3. **Test authentication**
4. **Apply RLS policies** to production database
