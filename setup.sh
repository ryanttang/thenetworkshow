#!/bin/bash

echo "🚀 Setting up THC Members Only Club..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventsdb?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# AWS S3 Configuration (bucket: thcmembersonlyclub)
AWS_REGION="us-west-2"
S3_BUCKET="thcmembersonlyclub"
AWS_ACCESS_KEY_ID="YOUR_AWS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET"
S3_PUBLIC_BASE_URL="https://thcmembersonlyclub.s3.us-west-2.amazonaws.com"
EOL
    echo "✅ .env.local created"
    echo "⚠️  Please update the DATABASE_URL with your actual PostgreSQL credentials"
    echo "⚠️  Please update AWS credentials if you want to use S3 features"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if PostgreSQL is running
echo "🐘 Checking PostgreSQL connection..."
if ! npx prisma db push --force-reset > /dev/null 2>&1; then
    echo "❌ Failed to connect to database"
    echo "Please ensure:"
    echo "1. PostgreSQL is running"
    echo "2. Database 'eventsdb' exists"
    echo "3. DATABASE_URL in .env.local is correct"
    echo ""
    echo "You can create the database with:"
    echo "createdb eventsdb"
    exit 1
fi

echo "✅ Database connection successful"

# Seed the database
echo "🌱 Seeding database with demo users..."
npm run seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Demo accounts created:"
echo "• admin@example.com / admin123!"
echo "• organizer@example.com / organizer123!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
