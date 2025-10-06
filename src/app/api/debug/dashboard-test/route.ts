import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { createLogger } from "@/lib/logger";

const logger = createLogger("dashboard-test");

export async function GET(request: NextRequest) {
  try {
    logger.info("Starting dashboard test");
    
    // Test 1: Environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    // Test 2: Session check
    const session = await getServerAuthSession();
    
    return NextResponse.json({
      success: true,
      message: "Debug route - Dashboard test completed",
      envCheck,
      session: session ? { hasSession: true, user: session.user?.email } : { hasSession: false },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Dashboard test error", error as Error);
    return NextResponse.json({ 
      error: "Dashboard test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}