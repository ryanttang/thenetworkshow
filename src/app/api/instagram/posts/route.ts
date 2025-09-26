import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "12", 10), 50);

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


