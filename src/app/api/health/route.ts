import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log("=== HEALTH CHECK DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel Env:", process.env.VERCEL_ENV);
    
    // Check DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL exists:", !!dbUrl);
    console.log("DATABASE_URL length:", dbUrl?.length || 0);
    
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
    
    // Check database connection with a simple query
    console.log("Attempting database connection...");
    await prisma.user.count();
    const dbLatency = Date.now() - startTime;
    console.log("✅ Database connected successfully in", dbLatency, "ms");
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'AWS_REGION',
      'S3_BUCKET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV,
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
        urlInfo: dbUrlInfo
      },
      environment_variables: {
        status: missingEnvVars.length === 0 ? 'complete' : 'incomplete',
        missing: missingEnvVars,
        databaseUrl: {
          exists: !!dbUrl,
          length: dbUrl?.length || 0
        }
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const statusCode = missingEnvVars.length === 0 ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error("=== HEALTH CHECK ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);
    console.error("Full error object:", error);
    
    const dbUrl = process.env.DATABASE_URL;
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
      } catch (e) {
        dbUrlInfo = { error: `Failed to parse: ${e}` };
      }
    }
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV,
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        urlInfo: dbUrlInfo
      },
      environment_variables: {
        databaseUrl: {
          exists: !!dbUrl,
          length: dbUrl?.length || 0
        }
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(healthStatus, { status: 503 });
  }
}
