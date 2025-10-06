const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function createDemoUsers() {
  try {
    console.log('Creating demo users...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'network_admin@example.com' },
      update: {},
      create: {
        email: 'network_admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
        hashedPassword: adminPassword
      }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create organizer user
    const organizerPassword = await bcrypt.hash('organizer123!', 10);
    const organizer = await prisma.user.upsert({
      where: { email: 'organizer@example.com' },
      update: {},
      create: {
        email: 'organizer@example.com',
        name: 'Organizer',
        role: 'ORGANIZER',
        hashedPassword: organizerPassword
      }
    });
    console.log('✅ Organizer user created:', organizer.email);

    console.log('Demo users created successfully!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUsers();
