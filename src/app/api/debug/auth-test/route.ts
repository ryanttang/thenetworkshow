import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("auth-test");

export async function POST(request: NextRequest) {
  
  try {
    logger.info("Testing authentication");
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    logger.info("Testing credentials", { email, hasPassword: !!password });
    
    // Test the authorize function directly
    const credentials = authOptions.providers[0] as any;
    
    logger.info("About to call authorize", { email, passwordLength: password.length });
    
    const result = await credentials.authorize({ email, password });
    
    logger.info("Authorization result", { result: result ? "success" : "failed", resultDetails: result });
    
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
    logger.error("Authentication test failed", error as Error);
    return NextResponse.json({ 
      error: "Authentication test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
