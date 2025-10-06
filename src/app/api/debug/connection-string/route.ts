import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Don't expose the full connection string for security
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'Not set';
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    database: {
      url: maskedUrl,
      hasUrl: !!dbUrl,
      urlLength: dbUrl?.length || 0
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    }
  });
}
