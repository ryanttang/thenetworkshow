import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("=== DATABASE CONNECTION TEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel Env:", process.env.VERCEL_ENV);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 50) + "...");
    
    // Test database connection
    console.log("Testing database connection...");
    const userCount = await prisma.user.count();
    console.log("✅ Database connected! User count:", userCount);
    
    // Test user lookup
    console.log("Testing user lookup...");
    const testUser = await prisma.user.findFirst();
    console.log("Test user found:", testUser ? "Yes" : "No");
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      hasUsers: !!testUser,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    });
    
  } catch (error) {
    console.error("=== DATABASE CONNECTION ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);
    console.error("Full error object:", error);
    
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    }, { status: 500 });
  }
}
