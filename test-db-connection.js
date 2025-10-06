#!/usr/bin/env node

// Simple database connection test script
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('=== DATABASE CONNECTION TEST ===');
  console.log('Timestamp:', new Date().toISOString());
  
  // Check environment variables
  const dbUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL exists:', !!dbUrl);
  console.log('DATABASE_URL length:', dbUrl?.length || 0);
  
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      console.log('Parsed URL:', {
        host: url.hostname,
        port: url.port,
        username: url.username,
        protocol: url.protocol,
        searchParams: url.search,
        pathname: url.pathname
      });
    } catch (e) {
      console.error('Failed to parse DATABASE_URL:', e);
    }
  }
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  
  try {
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: ['error', 'warn', 'info'],
    });
    
    console.log('Testing database connection...');
    const startTime = Date.now();
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const endTime = Date.now();
    
    console.log('✅ Database connection successful!');
    console.log('Query result:', result);
    console.log('Connection time:', endTime - startTime, 'ms');
    
    // Test user table
    console.log('Testing user table access...');
    const userCount = await prisma.user.count();
    console.log('✅ User table accessible, count:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

testConnection().catch(console.error);
