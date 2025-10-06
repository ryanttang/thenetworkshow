import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    const userCount = await prisma.user.count();
    
    // Test finding the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'network_admin@example.com' },
      select: { id: true, email: true, role: true, hashedPassword: true }
    });
    
    return NextResponse.json({
      success: true,
      userCount,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.hashedPassword
      } : null,
      timestamp: new Date().toISOString(),
      message: "Database connection test"
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Database test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
