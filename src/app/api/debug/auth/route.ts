import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log("Debug auth attempt:", { email, password: password ? "***" : "missing" });
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: "Missing email or password",
        step: "validation"
      });
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: "DATABASE_URL not configured",
        step: "env_check"
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        step: "user_lookup",
        email: email.toLowerCase()
      });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ 
        error: "User has no password",
        step: "password_check",
        user: { id: user.id, email: user.email, role: user.role }
      });
    }
    
    // Verify password
    const isValidPassword = await compare(password, user.hashedPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: "Invalid password",
        step: "password_verification",
        user: { id: user.id, email: user.email, role: user.role }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Authentication successful",
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }
    });
    
  } catch (error) {
    console.error("Debug auth error:", error);
    return NextResponse.json({ 
      error: "Database error",
      step: "database",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
