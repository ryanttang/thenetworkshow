import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user ID from email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const account = await prisma.instagramAccount.findFirst({ 
    where: { userId: user.id },
    select: {
      id: true,
      username: true,
      accountType: true,
      tokenExpiresAt: true,
      createdAt: true,
    }
  });

  return NextResponse.json({ account });
}
