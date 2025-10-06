import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      VERCEL_URL: process.env.VERCEL_URL || "❌ Missing",
    };
    
    return NextResponse.json({
      environment: envCheck,
      timestamp: new Date().toISOString(),
      message: "Environment diagnostic"
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Diagnostic failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
