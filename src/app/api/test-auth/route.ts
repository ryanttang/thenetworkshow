import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log("Testing auth for:", email);
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() }
    });
    
    console.log("User lookup result:", user ? { id: user.id, email: user.email, hasPassword: !!user.hashedPassword } : "not found");
    
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    
    if (!user.hashedPassword) {
      console.log("User has no password:", email);
      return NextResponse.json({ error: "No password set" }, { status: 401 });
    }
    
    const isValidPassword = await compare(password, user.hashedPassword);
    console.log("Password validation result:", isValidPassword);
    
    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    
    console.log("User authenticated successfully:", user.email);
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
    console.error("Auth test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
