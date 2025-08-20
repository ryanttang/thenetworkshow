# Setup Instructions

## 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/eventsdb?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-strong-secret-here"

# AWS S3 Configuration (bucket: thcmembersonlyclub)
AWS_REGION="us-west-2"
S3_BUCKET="thcmembersonlyclub"
AWS_ACCESS_KEY_ID="YOUR_AWS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET"
S3_PUBLIC_BASE_URL="https://thcmembersonlyclub.s3.us-west-2.amazonaws.com"
```

## 2. Database Setup

```bash
# Push the schema to your database
npx prisma db push

# Seed with demo users
npm run seed
```

## 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 4. Demo Accounts

After running the seed script, you can sign in with:

- **Admin**: `admin@example.com` / `admin123!`
- **Organizer**: `organizer@example.com` / `organizer123!`

## 5. S3 Bucket CORS Policy

Apply this CORS policy to your `thcmembersonlyclub` S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET","PUT","POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag","Content-Length","Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

## 6. Features Available

- ✅ Public event gallery
- ✅ User authentication (email/password + Google OAuth)
- ✅ Role-based access control
- ✅ Event creation and management
- ✅ Image upload with automatic optimization
- ✅ Responsive design with Chakra UI
- ✅ TypeScript support
- ✅ Prisma ORM with PostgreSQL
- ✅ AWS S3 integration

## 7. Next Steps

1. Configure your PostgreSQL database
2. Set up AWS S3 credentials
3. Customize the theme and branding
4. Add additional features as needed
5. Deploy to production

## 8. Troubleshooting

- **Build errors**: Ensure all dependencies are installed with `npm install`
- **Database errors**: Check your DATABASE_URL and ensure PostgreSQL is running
- **S3 errors**: Verify AWS credentials and bucket permissions
- **Auth errors**: Check NEXTAUTH_SECRET and OAuth configuration
