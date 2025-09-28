import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection with a simple query
    await prisma.user.count();
    const dbLatency = Date.now() - startTime;
    
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
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      environment_variables: {
        status: missingEnvVars.length === 0 ? 'complete' : 'incomplete',
        missing: missingEnvVars
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const statusCode = missingEnvVars.length === 0 ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(healthStatus, { status: 503 });
  }
}
