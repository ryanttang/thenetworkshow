import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text();
    console.log("=== RAW REQUEST DEBUG ===");
    console.log("Method:", request.method);
    console.log("URL:", request.url);
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    console.log("Body:", body);
    
    // Parse the form data
    const formData = new URLSearchParams(body);
    const email = formData.get('email');
    const password = formData.get('password');
    const csrfToken = formData.get('csrfToken');
    
    console.log("=== PARSED DATA ===");
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "missing");
    console.log("CSRF Token:", csrfToken ? "present" : "missing");
    
    // Test database connection
    console.log("=== DATABASE TEST ===");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "missing");
    
    // Try to import prisma and test connection
    try {
      const { prisma } = await import("@/lib/prisma");
      const userCount = await prisma.user.count();
      console.log("Database connected, user count:", userCount);
    } catch (dbError) {
      console.log("Database error:", dbError);
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        email,
        hasPassword: !!password,
        hasCsrfToken: !!csrfToken,
        databaseUrl: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
