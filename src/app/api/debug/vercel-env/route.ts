import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("=== VERCEL ENVIRONMENT DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());
    
    // Get all environment variables (without values for security)
    const envVars = Object.keys(process.env).sort();
    const relevantVars = envVars.filter(key => 
      key.includes('DATABASE') || 
      key.includes('NEXTAUTH') || 
      key.includes('VERCEL') ||
      key.includes('NODE')
    );
    
    console.log("Relevant environment variables:", relevantVars);
    
    // Check specific variables
    const dbUrl = process.env.DATABASE_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    console.log("DATABASE_URL exists:", !!dbUrl);
    console.log("DATABASE_URL length:", dbUrl?.length || 0);
    console.log("NEXTAUTH_SECRET exists:", !!nextAuthSecret);
    console.log("NEXTAUTH_URL:", nextAuthUrl);
    
    let dbUrlInfo = null;
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        dbUrlInfo = {
          host: url.hostname,
          port: url.port,
          username: url.username,
          protocol: url.protocol,
          searchParams: url.search,
          pathname: url.pathname
        };
        console.log("Parsed DATABASE_URL:", dbUrlInfo);
      } catch (e) {
        console.error("Failed to parse DATABASE_URL:", e);
        dbUrlInfo = { error: `Failed to parse: ${e}` };
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        vercelRegion: process.env.VERCEL_REGION
      },
      databaseUrl: {
        exists: !!dbUrl,
        length: dbUrl?.length || 0,
        info: dbUrlInfo
      },
      nextAuth: {
        secretExists: !!nextAuthSecret,
        secretLength: nextAuthSecret?.length || 0,
        url: nextAuthUrl
      },
      relevantEnvVars: relevantVars,
      allEnvVarsCount: envVars.length
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
