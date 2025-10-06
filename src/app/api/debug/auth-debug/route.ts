import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createLogger } from "@/lib/logger";
import { getRequestMeta } from "@/lib/request";

const logger = createLogger("auth-debug");

export async function POST(request: NextRequest) {
  const reqMeta = getRequestMeta(request);
  
  try {
    logger.info("Testing authentication step by step", { ...reqMeta });
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    logger.info("Step 1: Testing credentials", { ...reqMeta, email, hasPassword: !!password });
    
    // Step 1: Check if user exists
    logger.info("Step 2: Looking up user in database", { ...reqMeta, email });
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    logger.info("Step 3: User lookup result", { ...reqMeta, userFound: !!user, userId: user?.id, hasPassword: !!user?.hashedPassword });
    
    if (!user) {
      logger.warn("Step 4: User not found", { ...reqMeta, email });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    if (!user.hashedPassword) {
      logger.warn("Step 5: User has no password", { ...reqMeta, email });
      return NextResponse.json({ error: "User has no password" }, { status: 400 });
    }
    
    // Step 2: Compare password
    logger.info("Step 6: Comparing password", { ...reqMeta, email });
    const isValidPassword = await compare(password, user.hashedPassword);
    
    logger.info("Step 7: Password comparison result", { ...reqMeta, email, isValidPassword });
    
    if (!isValidPassword) {
      logger.warn("Step 8: Invalid password", { ...reqMeta, email });
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    
    logger.info("Step 9: Authentication successful", { ...reqMeta, email, userId: user.id });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    logger.error("Authentication debug failed", error as Error, { ...reqMeta });
    return NextResponse.json({ 
      error: "Authentication debug failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
