import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";
import { createLogger } from "@/lib/logger";
import { getRequestMeta } from "@/lib/request";

const logger = createLogger("auth-test");

export async function POST(request: NextRequest) {
  const reqMeta = getRequestMeta();
  
  try {
    logger.info("Testing authentication", { ...reqMeta });
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    logger.info("Testing credentials", { ...reqMeta, email, hasPassword: !!password });
    
    // Test the authorize function directly
    const credentials = authOptions.providers[0] as any;
    
    logger.info("About to call authorize", { ...reqMeta, email, passwordLength: password.length });
    
    const result = await credentials.authorize({ email, password });
    
    logger.info("Authorization result", { ...reqMeta, result: result ? "success" : "failed", resultDetails: result });
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        user: {
          id: result.id,
          email: result.email,
          role: result.role,
          name: result.name
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
  } catch (error) {
    logger.error("Authentication test failed", error as Error, { ...reqMeta });
    return NextResponse.json({ 
      error: "Authentication test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
