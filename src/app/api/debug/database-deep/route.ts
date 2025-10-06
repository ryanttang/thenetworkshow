import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
    databaseUrl: {
      exists: !!process.env.DATABASE_URL,
      length: process.env.DATABASE_URL?.length || 0,
    },
    tests: []
  };

  try {
    console.log("=== COMPREHENSIVE DATABASE DEBUG ===");
    console.log("Timestamp:", debugInfo.timestamp);
    
    // Test 1: Environment Variables
    console.log("=== TEST 1: ENVIRONMENT VARIABLES ===");
    const dbUrl = process.env.DATABASE_URL;
    console.log("DATABASE_URL exists:", !!dbUrl);
    console.log("DATABASE_URL length:", dbUrl?.length || 0);
    
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        debugInfo.databaseUrl.host = url.hostname;
        debugInfo.databaseUrl.port = url.port;
        debugInfo.databaseUrl.username = url.username;
        debugInfo.databaseUrl.protocol = url.protocol;
        debugInfo.databaseUrl.searchParams = url.search;
        debugInfo.databaseUrl.pathname = url.pathname;
        
        console.log("Parsed URL:", {
          host: url.hostname,
          port: url.port,
          username: url.username,
          protocol: url.protocol,
          searchParams: url.search,
          pathname: url.pathname
        });
        
        debugInfo.tests.push({
          test: "Environment Variables",
          status: "PASS",
          details: "DATABASE_URL is properly formatted"
        });
      } catch (e) {
        console.error("Failed to parse DATABASE_URL:", e);
        debugInfo.tests.push({
          test: "Environment Variables",
          status: "FAIL",
          details: `Failed to parse DATABASE_URL: ${e}`
        });
      }
    } else {
      debugInfo.tests.push({
        test: "Environment Variables",
        status: "FAIL",
        details: "DATABASE_URL is not set"
      });
    }

    // Test 2: Basic Prisma Client Creation
    console.log("=== TEST 2: PRISMA CLIENT CREATION ===");
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ['error', 'warn', 'info'],
      });
      
      debugInfo.tests.push({
        test: "Prisma Client Creation",
        status: "PASS",
        details: "Prisma client created successfully"
      });
      
      // Test 3: Database Connection Test
      console.log("=== TEST 3: DATABASE CONNECTION TEST ===");
      try {
        console.log("Attempting to connect to database...");
        const startTime = Date.now();
        
        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        const endTime = Date.now();
        
        console.log("✅ Database connection successful!");
        console.log("Query result:", result);
        console.log("Connection time:", endTime - startTime, "ms");
        
        debugInfo.tests.push({
          test: "Database Connection",
          status: "PASS",
          details: `Connected successfully in ${endTime - startTime}ms`,
          queryResult: result
        });
        
        // Test 4: User Table Access
        console.log("=== TEST 4: USER TABLE ACCESS ===");
        try {
          const userCount = await prisma.user.count();
          console.log("✅ User table accessible, count:", userCount);
          
          debugInfo.tests.push({
            test: "User Table Access",
            status: "PASS",
            details: `User table accessible, ${userCount} users found`
          });
          
        } catch (userError) {
          console.error("❌ User table access failed:", userError);
          debugInfo.tests.push({
            test: "User Table Access",
            status: "FAIL",
            details: `User table access failed: ${userError instanceof Error ? userError.message : userError}`
          });
        }
        
      } catch (connectionError) {
        console.error("❌ Database connection failed:", connectionError);
        debugInfo.tests.push({
          test: "Database Connection",
          status: "FAIL",
          details: `Connection failed: ${connectionError instanceof Error ? connectionError.message : connectionError}`,
          errorType: connectionError?.constructor?.name,
          errorStack: connectionError instanceof Error ? connectionError.stack : undefined
        });
      }
      
      // Test 5: Prisma Disconnect
      console.log("=== TEST 5: PRISMA DISCONNECT ===");
      try {
        await prisma.$disconnect();
        console.log("✅ Prisma disconnected successfully");
        
        debugInfo.tests.push({
          test: "Prisma Disconnect",
          status: "PASS",
          details: "Disconnected successfully"
        });
        
      } catch (disconnectError) {
        console.error("❌ Prisma disconnect failed:", disconnectError);
        debugInfo.tests.push({
          test: "Prisma Disconnect",
          status: "FAIL",
          details: `Disconnect failed: ${disconnectError instanceof Error ? disconnectError.message : disconnectError}`
        });
      }
      
    } catch (prismaError) {
      console.error("❌ Prisma client creation failed:", prismaError);
      debugInfo.tests.push({
        test: "Prisma Client Creation",
        status: "FAIL",
        details: `Client creation failed: ${prismaError instanceof Error ? prismaError.message : prismaError}`,
        errorType: prismaError?.constructor?.name,
        errorStack: prismaError instanceof Error ? prismaError.stack : undefined
      });
    }

    // Test 6: Network Connectivity Test (if possible)
    console.log("=== TEST 6: NETWORK CONNECTIVITY ===");
    try {
      if (debugInfo.databaseUrl.host) {
        // This is a basic test - in production, we can't directly test network connectivity
        // but we can check if the hostname resolves
        debugInfo.tests.push({
          test: "Network Connectivity",
          status: "INFO",
          details: `Target host: ${debugInfo.databaseUrl.host}:${debugInfo.databaseUrl.port}`,
          note: "Cannot test network connectivity from serverless environment"
        });
      }
    } catch (networkError) {
      debugInfo.tests.push({
        test: "Network Connectivity",
        status: "FAIL",
        details: `Network test failed: ${networkError instanceof Error ? networkError.message : networkError}`
      });
    }

    console.log("=== DEBUG SUMMARY ===");
    debugInfo.tests.forEach((test: any) => {
      console.log(`${test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : 'ℹ️'} ${test.test}: ${test.details}`);
    });

    return NextResponse.json({
      success: true,
      ...debugInfo
    });

  } catch (error) {
    console.error("=== DEBUG ENDPOINT ERROR ===");
    console.error("Error:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
      errorStack: error instanceof Error ? error.stack : undefined,
      ...debugInfo
    }, { status: 500 });
  }
}
