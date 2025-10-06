import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCoordinationSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
  specialMessage: z.string().optional(),
  pointOfContacts: z.array(z.object({
    name: z.string().optional().or(z.literal("")),
    number: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
  })).optional(),
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
    const owner = searchParams.get("owner"); // Allow admin to specify owner filter
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Admins and Organizers can see all coordinations, others only see their own
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    let whereClause: any = {
      ...(canManageAllEvents && owner !== "me" ? {} : { event: { ownerId: user.id } }),
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    // By default, exclude archived coordinations unless explicitly requested
    if (!includeArchived) {
      whereClause.isArchived = false;
    }

    const coordinations = await prisma.coordination.findMany({
      where: whereClause,
      select: {
        id: true,
        eventId: true,
        title: true,
        description: true,
        notes: true,
        shareToken: true,
        slug: true,
        isActive: true,
        isArchived: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            owner: { select: { name: true, email: true } }
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
    const { eventId, title, description, notes, specialMessage, pointOfContacts } = createCoordinationSchema.parse(body);

    // Admins and Organizers can create coordinations for any event
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    // Verify the event exists and user has permission to access it
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ...(canManageAllEvents ? {} : { ownerId: user.id }),
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found or permission denied" }, { status: 404 });
    }

    // Create slug from event title and coordination title
    const createSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    // Combine event title and coordination title for the slug
    const combinedTitle = `${event.title} ${title}`;
    const baseSlug = createSlug(combinedTitle);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique by appending numbers if needed
    while (true) {
      const existing = await prisma.coordination.findFirst({
        where: { slug: slug }
      });
      
      if (!existing) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const coordination = await prisma.coordination.create({
      data: {
        eventId,
        title,
        description,
        notes,
        specialMessage,
        pointOfContacts: pointOfContacts || [],
        slug,
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