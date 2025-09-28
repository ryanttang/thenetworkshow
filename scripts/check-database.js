#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tables found:', tables.length);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if User table has data
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Users in database: ${userCount}`);
      
      if (userCount === 0) {
        console.log('⚠️  No users found. You may need to run the seed script.');
      }
    } catch (error) {
      console.log('❌ User table not found or not accessible');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if Supabase database is paused');
      console.log('2. Resume the database in Supabase dashboard');
      console.log('3. Verify DATABASE_URL is correct');
      console.log('4. Check if database exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);
