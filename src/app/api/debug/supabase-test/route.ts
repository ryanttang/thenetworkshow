import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("supabase-test");

export async function GET(request: NextRequest) {
  try {
    logger.info("Testing Supabase connection");
    
    // Basic test - just return success since we're using direct Prisma now
    return NextResponse.json({ 
      success: true, 
      message: "Debug route - Supabase testing disabled, using direct Prisma",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Debug test error", error as Error);
    return NextResponse.json({ 
      error: "Debug test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}