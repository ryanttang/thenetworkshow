export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";
import { z } from "zod";
import { supabaseRequest } from "@/lib/supabase-server";

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

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const owner = searchParams.get("owner"); // Allow admin to specify owner filter
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Admins and Organizers can see all coordinations, others only see their own
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    let whereClause: any = {};
    
    if (!canManageAllEvents || owner === "me") {
      // For non-admin users or when explicitly requesting own coordinations
      whereClause["event.ownerId"] = user.id;
    }

    if (eventId) {
      whereClause.eventId = eventId;
    }

    // By default, exclude archived coordinations unless explicitly requested
    if (!includeArchived) {
      whereClause.isArchived = false;
    }

    // Get coordinations using Supabase REST API
    const coordinations = await supabase.findMany("Coordination", {
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: "*, event:Event(*), documents:CoordinationDocument(*)"
    }) as any[];

    // Transform the data to match the expected format
    const transformedCoordinations = coordinations.map(coord => ({
      id: coord.id,
      eventId: coord.eventId,
      title: coord.title,
      description: coord.description,
      notes: coord.notes,
      shareToken: coord.shareToken,
      slug: coord.slug,
      isActive: coord.isActive,
      isArchived: coord.isArchived,
      createdAt: coord.createdAt,
      event: coord.event,
      documents: coord.documents || [],
      _count: {
        documents: coord.documents?.length || 0
      }
    }));

    return NextResponse.json(transformedCoordinations);
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

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { eventId, title, description, notes, specialMessage, pointOfContacts } = createCoordinationSchema.parse(body);

    // Admins and Organizers can create coordinations for any event
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    // Verify the event exists and user has permission to access it
    const eventWhere = canManageAllEvents ? { id: eventId } : { id: eventId, ownerId: user.id };
    const event = await supabase.findUnique("Event", eventWhere) as any;

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
      const existing = await supabase.findUnique("Coordination", { slug }) as any;
      
      if (!existing) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const coordinationData = {
      eventId,
      title,
      description,
      notes,
      specialMessage,
      pointOfContacts: pointOfContacts || [],
      slug,
    };

    // Create coordination using SupabaseRequest utility
    const coordinationResponse = await supabaseRequest('Coordination', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(coordinationData)
    }, true); // Use service role

    const coordinationArray = await coordinationResponse.json();
    const coordination = coordinationArray[0]; // Supabase returns an array

    // Get the created coordination with related data
    const fullCoordination = await supabase.findUnique("Coordination", { id: coordination.id }) as any;

    return NextResponse.json(fullCoordination, { status: 201 });
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
