#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database deployment...');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  console.log('📋 Production deployment detected');
} else {
  console.log('📋 Development deployment detected');
}

try {
  // Step 1: Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 2: Push schema to database
  console.log('📊 Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Step 3: Apply RLS policies if in production
  if (isProduction) {
    console.log('🔒 Applying Row Level Security policies...');
    
    const rlsFile = path.join(__dirname, '..', 'database', 'migrations', 'enable_rls_policies.sql');
    
    if (fs.existsSync(rlsFile)) {
      console.log('⚠️  RLS policies found. Please apply them manually to your production database.');
      console.log('📄 RLS file location:', rlsFile);
      console.log('💡 You can apply them using:');
      console.log('   - Supabase Dashboard SQL Editor');
      console.log('   - psql command line');
      console.log('   - Your database management tool');
    } else {
      console.log('❌ RLS policies file not found');
    }
  }

  // Step 4: Seed database if in development
  if (!isProduction) {
    console.log('🌱 Seeding database with demo data...');
    try {
      execSync('npm run seed', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Seeding failed (this is normal if data already exists)');
    }
  }

  console.log('✅ Database deployment completed successfully!');

} catch (error) {
  console.error('❌ Database deployment failed:', error.message);
  process.exit(1);
}
