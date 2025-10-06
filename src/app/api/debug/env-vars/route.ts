import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log("VERCEL_URL:", process.env.VERCEL_URL);
    
    // Check DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL exists:", !!dbUrl);
    console.log("DATABASE_URL length:", dbUrl?.length || 0);
    
    if (dbUrl) {
      // Parse the URL to show structure without exposing password
      try {
        const url = new URL(dbUrl);
        console.log("Database host:", url.hostname);
        console.log("Database port:", url.port);
        console.log("Database username:", url.username);
        console.log("Database pathname:", url.pathname);
        console.log("Database search params:", url.search);
        console.log("Database protocol:", url.protocol);
      } catch (e) {
        console.log("Failed to parse DATABASE_URL:", e);
      }
    }
    
    // Check other auth variables
    console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        databaseUrl: {
          exists: !!dbUrl,
          length: dbUrl?.length || 0,
          host: dbUrl ? new URL(dbUrl).hostname : null,
          port: dbUrl ? new URL(dbUrl).port : null,
          username: dbUrl ? new URL(dbUrl).username : null,
          protocol: dbUrl ? new URL(dbUrl).protocol : null,
          searchParams: dbUrl ? new URL(dbUrl).search : null
        },
        nextAuthSecret: {
          exists: !!process.env.NEXTAUTH_SECRET,
          length: process.env.NEXTAUTH_SECRET?.length || 0
        },
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    });
    
  } catch (error) {
    console.error("Environment debug error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
