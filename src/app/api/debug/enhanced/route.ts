import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test basic environment
    const basicEnv = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    };
    
    // Test Prisma import
    let prismaStatus = "❌ Failed to import";
    try {
      const { PrismaClient } = await import('@prisma/client');
      prismaStatus = "✅ Imported successfully";
    } catch (error) {
      prismaStatus = `❌ Import error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return NextResponse.json({
      environment: basicEnv,
      prisma: prismaStatus,
      timestamp: new Date().toISOString(),
      message: "Enhanced diagnostic"
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Diagnostic failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
