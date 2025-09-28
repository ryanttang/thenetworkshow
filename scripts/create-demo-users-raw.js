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
    console.log('Creating demo users with raw SQL...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123!', 10);
    const adminEmail = 'admin@example.com';
    
    // Check if admin exists
    const existingAdmin = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = ${adminEmail}
    `;
    
    if (existingAdmin.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "User" (id, email, name, "hashedPassword", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${adminEmail}, 'Admin', ${adminPassword}, 'ADMIN', NOW(), NOW())
      `;
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('✅ Admin user already exists:', adminEmail);
    }

    // Create organizer user
    const organizerPassword = await bcrypt.hash('organizer123!', 10);
    const organizerEmail = 'organizer@example.com';
    
    // Check if organizer exists
    const existingOrganizer = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = ${organizerEmail}
    `;
    
    if (existingOrganizer.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "User" (id, email, name, "hashedPassword", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${organizerEmail}, 'Organizer', ${organizerPassword}, 'ORGANIZER', NOW(), NOW())
      `;
      console.log('✅ Organizer user created:', organizerEmail);
    } else {
      console.log('✅ Organizer user already exists:', organizerEmail);
    }

    console.log('Demo users created successfully!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUsers();
