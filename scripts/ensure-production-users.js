#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureUsersExist() {
  try {
    console.log('🔍 Checking production database...');
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'network_admin@example.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found, creating...');
      const hashedPassword = await bcrypt.hash('admin123!', 10);
      
      await prisma.user.create({
        data: {
          email: 'network_admin@example.com',
          name: 'Admin',
          role: 'ADMIN',
          hashedPassword: hashedPassword
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists:', adminUser.email, adminUser.role);
    }
    
    // Check if organizer user exists
    const organizerUser = await prisma.user.findUnique({
      where: { email: 'organizer@example.com' }
    });
    
    if (!organizerUser) {
      console.log('❌ Organizer user not found, creating...');
      const hashedPassword = await bcrypt.hash('organizer123!', 10);
      
      await prisma.user.create({
        data: {
          email: 'organizer@example.com',
          name: 'Organizer',
          role: 'ORGANIZER',
          hashedPassword: hashedPassword
        }
      });
      console.log('✅ Organizer user created');
    } else {
      console.log('✅ Organizer user exists:', organizerUser.email, organizerUser.role);
    }
    
    // Test authentication
    console.log('🔐 Testing authentication...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'network_admin@example.com' }
    });
    
    if (testUser && testUser.hashedPassword) {
      const isValid = await bcrypt.compare('admin123!', testUser.hashedPassword);
      console.log('🔑 Password validation:', isValid ? '✅ Valid' : '❌ Invalid');
    }
    
    console.log('🎉 Production database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

ensureUsersExist();
