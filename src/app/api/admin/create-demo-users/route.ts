import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST() {
  try {
    console.log('Creating demo users...');
    
    // Create admin user
    const adminPassword = await hash('admin123!', 10);
    const adminEmail = 'admin@example.com';
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          role: 'ADMIN',
          hashedPassword: adminPassword
        }
      });
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('✅ Admin user already exists:', adminEmail);
    }

    // Create organizer user
    const organizerPassword = await hash('organizer123!', 10);
    const organizerEmail = 'organizer@example.com';
    
    // Check if organizer exists
    const existingOrganizer = await prisma.user.findUnique({
      where: { email: organizerEmail }
    });
    
    if (!existingOrganizer) {
      await prisma.user.create({
        data: {
          email: organizerEmail,
          name: 'Organizer',
          role: 'ORGANIZER',
          hashedPassword: organizerPassword
        }
      });
      console.log('✅ Organizer user created:', organizerEmail);
    } else {
      console.log('✅ Organizer user already exists:', organizerEmail);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo users created successfully' 
    });
  } catch (error) {
    console.error('Error creating demo users:', error);
    return NextResponse.json(
      { error: 'Failed to create demo users' },
      { status: 500 }
    );
  }
}
