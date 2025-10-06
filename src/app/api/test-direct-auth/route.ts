import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const formData = new URLSearchParams(body);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log("=== DIRECT AUTH TEST ===");
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "missing");
    
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    
    // Test database connection directly
    console.log("Testing database connection...");
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() }
    });
    
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    
    if (!user.hashedPassword) {
      return NextResponse.json({ error: "User has no password" }, { status: 401 });
    }
    
    console.log("Testing password...");
    const isValidPassword = await compare(password, user.hashedPassword);
    console.log("Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    
    console.log("Authentication successful!");
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });
    
  } catch (error) {
    console.error("Direct auth error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
