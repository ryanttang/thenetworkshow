import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCoordinationSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    let whereClause: any = {
      event: {
        ownerId: user.id,
      },
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const coordinations = await prisma.coordination.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        documents: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coordinations);
  } catch (error) {
    console.error("Error fetching coordinations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { eventId, title, description, notes } = createCoordinationSchema.parse(body);

    // Verify the event belongs to the user
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ownerId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const coordination = await prisma.coordination.create({
      data: {
        eventId,
        title,
        description,
        notes,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        documents: true,
      },
    });

    return NextResponse.json(coordination, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
