import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCoordinationSchema = z.object({
  eventId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  specialMessage: z.string().optional(),
  pointOfContacts: z.array(z.object({
    name: z.string().optional().or(z.literal("")),
    number: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
  })).optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const coordination = await prisma.coordination.findFirst({
      where: {
        id: params.id,
        event: {
          ownerId: user.id,
        },
      },
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
      },
    });

    if (!coordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    return NextResponse.json(coordination);
  } catch (error) {
    console.error("Error fetching coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData = updateCoordinationSchema.parse(body);

    // Verify the coordination belongs to the user
    const existingCoordination = await prisma.coordination.findFirst({
      where: {
        id: params.id,
        event: {
          ownerId: user.id,
        },
      },
    });

    if (!existingCoordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    // If eventId is being updated, verify the new event exists and user has permission
    if (updateData.eventId && updateData.eventId !== existingCoordination.eventId) {
      const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";
      
      const newEvent = await prisma.event.findFirst({
        where: {
          id: updateData.eventId,
          ...(canManageAllEvents ? {} : { ownerId: user.id }),
        },
      });

      if (!newEvent) {
        return NextResponse.json({ error: "Event not found or permission denied" }, { status: 404 });
      }
    }

    const coordination = await prisma.coordination.update({
      where: { id: params.id },
      data: updateData,
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
      },
    });

    return NextResponse.json(coordination);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify the coordination belongs to the user
    const existingCoordination = await prisma.coordination.findFirst({
      where: {
        id: params.id,
        event: {
          ownerId: user.id,
        },
      },
    });

    if (!existingCoordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    await prisma.coordination.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
