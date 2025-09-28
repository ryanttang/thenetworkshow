import { NextRequest, NextResponse } from "next/server";
import { prisma, setUserContext } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "12", 10), 50);

  // Get session to set user context for RLS
  const session = await getServerAuthSession();
  let userId = null;
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    userId = user?.id || null;
  }
  
  // Set user context for RLS policies
  await setUserContext(userId);

  const posts = await prisma.instagramPost.findMany({
    where: { isPublished: true },
    orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      igMediaId: true,
      mediaType: true,
      mediaUrl: true,
      thumbnailUrl: true,
      permalink: true,
      caption: true,
      takenAt: true,
      account: { select: { username: true } },
    },
  });

  return NextResponse.json({ posts });
}


