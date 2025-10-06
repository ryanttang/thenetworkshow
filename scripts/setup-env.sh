#!/bin/bash

# The Network Show - Environment Setup Script
# This script helps you set up your environment variables for Supabase

echo "🚀 The Network Show - Environment Setup"
echo "========================================"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

echo ""
echo "📋 Please provide your Supabase configuration:"
echo ""

# Get Supabase details
read -p "Enter your Supabase project reference (e.g., abcdefghijklmnop): " PROJECT_REF
read -p "Enter your Supabase database password: " -s DB_PASSWORD
echo ""

# Create .env file
cat > .env << EOF
# The Network Show - Environment Configuration
# Generated on $(date)

# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# AWS S3 Configuration
AWS_REGION="us-west-2"
S3_BUCKET="thenetworkshow"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
S3_PUBLIC_BASE_URL="https://thenetworkshow.s3.us-west-2.amazonaws.com"

# Instagram Configuration (optional)
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/instagram/callback"

# Facebook/Instagram Graph API (optional)
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/instagram/callback"

# Google Analytics (optional)
GOOGLE_VERIFICATION_ID=""
GOOGLE_ANALYTICS_ID=""

# Supabase Configuration (if using Supabase features)
NEXT_PUBLIC_SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
EOF

echo ""
echo "✅ Environment file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update AWS credentials in .env file if needed"
echo "2. Add Supabase keys if using Supabase features"
echo "3. Run: npm run db:push (to sync your database schema)"
echo "4. Run: node scripts/create-admin-organizer-users.js (to create users)"
echo ""
echo "🔗 Your Supabase project URL: https://${PROJECT_REF}.supabase.co"
echo ""
