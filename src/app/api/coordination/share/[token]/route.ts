import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Try to find by slug first, then fall back to shareToken
    let coordination = await prisma.coordination.findFirst({
      where: {
        OR: [
          { slug: params.token },
          { shareToken: params.token }
        ],
        isActive: true,
        isArchived: false,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            endAt: true,
            locationName: true,
            address: true,
            city: true,
            state: true,
            heroImage: {
              select: {
                id: true,
                variants: true,
              },
            },
          },
        },
        documents: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!coordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    return NextResponse.json(coordination);
  } catch (error) {
    console.error("Error fetching shared coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
