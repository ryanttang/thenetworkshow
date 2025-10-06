import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== COMPREHENSIVE AUTH DEBUG ===");
    
    // Test 1: Basic database connection
    console.log("1. Testing basic database connection...");
    try {
      const userCount = await prisma.user.count();
      console.log("✅ Database connected, user count:", userCount);
    } catch (dbError) {
      console.log("❌ Database error:", dbError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }
    
    // Test 2: Find a specific user
    console.log("2. Testing user lookup...");
    try {
      const user = await prisma.user.findFirst();
      console.log("✅ User found:", user ? { id: user.id, email: user.email, hasPassword: !!user.hashedPassword } : "No users");
    } catch (userError) {
      console.log("❌ User lookup error:", userError);
    }
    
    // Test 3: Test with specific credentials
    console.log("3. Testing with network_admin@example.com...");
    try {
      const testUser = await prisma.user.findUnique({
        where: { email: "network_admin@example.com" }
      });
      console.log("✅ Test user found:", testUser ? "Yes" : "No");
      if (testUser) {
        console.log("User details:", {
          id: testUser.id,
          email: testUser.email,
          hasPassword: !!testUser.hashedPassword,
          role: testUser.role
        });
      }
    } catch (testError) {
      console.log("❌ Test user lookup error:", testError);
    }
    
    // Test 4: Environment check
    console.log("4. Environment check...");
    console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    console.log("NEXTAUTH_SECRET:", !!process.env.NEXTAUTH_SECRET);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    return NextResponse.json({
      success: true,
      message: "Comprehensive auth debug completed",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Comprehensive debug error:", error);
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
