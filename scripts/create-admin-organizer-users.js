#!/usr/bin/env node

/**
 * Create Admin and Organizer Users for The Network Show
 * 
 * This script creates admin and organizer users with secure passwords
 * for your Supabase-powered application.
 * 
 * Usage:
 * 1. Set your DATABASE_URL environment variable
 * 2. Run: node scripts/create-admin-organizer-users.js
 * 
 * Or run with DATABASE_URL inline:
 * DATABASE_URL="your-supabase-url" node scripts/create-admin-organizer-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUsers() {
  try {
    console.log('🚀 Creating Admin and Organizer Users for The Network Show');
    console.log('=' .repeat(60));
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL environment variable is not set.');
      console.log('\nPlease set your Supabase DATABASE_URL:');
      console.log('export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?schema=public"');
      console.log('\nOr run this script with the DATABASE_URL inline:');
      console.log('DATABASE_URL="your-url" node scripts/create-admin-organizer-users.js');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL is configured');
    console.log('📊 Testing database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Get custom credentials or use defaults
    console.log('\n📝 User Creation Options:');
    console.log('1. Use default credentials (admin@example.com / organizer@example.com)');
    console.log('2. Enter custom credentials');
    
    const choice = await question('\nEnter your choice (1 or 2): ');
    
    let adminEmail, adminPassword, organizerEmail, organizerPassword;
    
    if (choice === '2') {
      console.log('\n🔐 Enter Admin User Credentials:');
      adminEmail = await question('Admin Email: ');
      adminPassword = await question('Admin Password (min 8 chars): ');
      
      console.log('\n🔐 Enter Organizer User Credentials:');
      organizerEmail = await question('Organizer Email: ');
      organizerPassword = await question('Organizer Password (min 8 chars): ');
    } else {
      // Default credentials
      adminEmail = 'network_admin@example.com';
      adminPassword = 'Admin123!@#';
      organizerEmail = 'organizer@example.com';
      organizerPassword = 'Organizer123!@#';
      
      console.log('\n📋 Using default credentials:');
      console.log(`Admin: ${adminEmail} / ${adminPassword}`);
      console.log(`Organizer: ${organizerEmail} / ${organizerPassword}`);
    }
    
    console.log('\n🔄 Creating users...');
    
    // Hash passwords
    const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
    const organizerHashedPassword = await bcrypt.hash(organizerPassword, 12);
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        name: 'Admin User',
        role: 'ADMIN',
        hashedPassword: adminHashedPassword
      },
      create: {
        email: adminEmail.toLowerCase(),
        name: 'Admin User',
        role: 'ADMIN',
        hashedPassword: adminHashedPassword
      }
    });
    console.log('✅ Admin user created/updated:', admin.email);
    
    // Create organizer user
    const organizer = await prisma.user.upsert({
      where: { email: organizerEmail.toLowerCase() },
      update: {
        name: 'Organizer User',
        role: 'ORGANIZER',
        hashedPassword: organizerHashedPassword
      },
      create: {
        email: organizerEmail.toLowerCase(),
        name: 'Organizer User',
        role: 'ORGANIZER',
        hashedPassword: organizerHashedPassword
      }
    });
    console.log('✅ Organizer user created/updated:', organizer.email);
    
    console.log('\n🎉 Users created successfully!');
    console.log('=' .repeat(60));
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('=' .repeat(60));
    console.log(`👑 ADMIN USER:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log('');
    console.log(`🎪 ORGANIZER USER:`);
    console.log(`   Email: ${organizer.email}`);
    console.log(`   Password: ${organizerPassword}`);
    console.log(`   Role: ${organizer.role}`);
    console.log('=' .repeat(60));
    console.log('\n🔗 You can now log in at: http://localhost:3000/signin');
    console.log('💡 Admin users can access the dashboard and manage all content');
    console.log('💡 Organizer users can create and manage events');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('1. Your DATABASE_URL is correct');
      console.log('2. Your Supabase project is running');
      console.log('3. Your database password is correct');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
createUsers();
