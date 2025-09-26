import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.instagramAccount.findFirst({ 
    where: { userId: session.user.id as string },
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
