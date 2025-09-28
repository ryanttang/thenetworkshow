# Deployment Guide

This guide covers deploying the THC Members Only Club application to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- AWS S3 bucket configured
- Domain name (optional but recommended)

## Environment Setup

### 1. Production Environment Variables

Copy the production environment template:

```bash
cp env.production.example .env.production
```

Fill in the required values:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/eventsdb?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"

# AWS S3
AWS_REGION="us-west-2"
S3_BUCKET="thcmembersonlyclub"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_PUBLIC_BASE_URL="https://thcmembersonlyclub.s3.us-west-2.amazonaws.com"
```

### 2. Database Setup

#### Option A: Using the deployment script

```bash
npm run deploy:db
```

#### Option B: Manual setup

1. **Create database:**
   ```sql
   CREATE DATABASE eventsdb;
   ```

2. **Apply Prisma schema:**
   ```bash
   npx prisma db push
   ```

3. **Apply RLS policies:**
   - Copy the contents of `database/migrations/enable_rls_policies.sql`
   - Run it in your database management tool

### 3. S3 Bucket Configuration

Ensure your S3 bucket has the correct CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

### Option 2: Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Or build manually:**
   ```bash
   docker build -t thc-members .
   docker run -p 3000:3000 --env-file .env.production thc-members
   ```

### Option 3: Traditional Server

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "thc-members" -- start
   ```

## Post-Deployment Verification

### 1. Run verification script

```bash
npm run verify
```

### 2. Manual checks

- [ ] Health endpoint: `https://yourdomain.com/api/health`
- [ ] Main page loads: `https://yourdomain.com`
- [ ] Authentication works
- [ ] File uploads work
- [ ] Database queries work
- [ ] Security headers present

### 3. Security verification

- [ ] RLS policies applied
- [ ] CSP headers working
- [ ] Rate limiting active
- [ ] HTTPS enabled
- [ ] No sensitive data in logs

## Monitoring and Maintenance

### 1. Health Monitoring

The application includes a health check endpoint at `/api/health` that reports:
- Database connectivity
- Environment variable status
- Application uptime
- System status

### 2. Logging

- Application logs are structured JSON in production
- Error tracking available (configure Sentry DSN)
- Performance monitoring included

### 3. Performance

- Image optimization enabled
- Caching implemented
- Bundle optimization active
- CDN recommended for static assets

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall rules

2. **S3 uploads failing**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Verify CORS policy

3. **Authentication not working**
   - Check NEXTAUTH_URL matches domain
   - Verify NEXTAUTH_SECRET is set
   - Check OAuth provider settings

4. **Build failures**
   - Run `npm run typecheck`
   - Check for missing dependencies
   - Verify environment variables

### Getting Help

1. Check application logs
2. Run verification script
3. Test health endpoint
4. Review environment configuration

## Security Checklist

- [ ] RLS policies applied to all tables
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] AWS credentials with minimal permissions
- [ ] Regular security updates
- [ ] Monitoring and alerting configured

## Performance Checklist

- [ ] Image optimization enabled
- [ ] Caching implemented
- [ ] Bundle optimization active
- [ ] CDN configured
- [ ] Database queries optimized
- [ ] Monitoring in place
- [ ] Error tracking configured

## Backup and Recovery

### Database Backups

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

### S3 Backups

- Enable S3 versioning
- Configure lifecycle policies
- Set up cross-region replication if needed

## Scaling Considerations

- Use connection pooling for database
- Implement Redis for caching
- Use CDN for static assets
- Consider horizontal scaling with load balancer
- Monitor resource usage
- Set up auto-scaling policies
