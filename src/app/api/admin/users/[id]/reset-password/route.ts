import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/rbac";
import { hash } from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!isAdmin(currentUser?.role)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const userId = params.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();
    
    // Hash the temporary password
    const hashedPassword = await hash(temporaryPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      temporaryPassword: temporaryPassword
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateTemporaryPassword(): string {
  // Generate a readable temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Ensure it contains at least one uppercase, lowercase, and number
  result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  result += '0123456789'[Math.floor(Math.random() * 10)];
  
  // Fill the rest randomly
  for (let i = 3; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the result
  return result.split('').sort(() => Math.random() - 0.5).join('');
}
