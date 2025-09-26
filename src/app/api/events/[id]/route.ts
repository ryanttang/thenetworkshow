import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validation";
import { canEditEvent } from "@/lib/rbac";

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string }}
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Look up by ID (for authenticated users)
    const event = await prisma.event.findUnique({
      where: { id: id },
      include: { heroImage: true, images: true, owner: true }
    });
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const session = await getServerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { email: session.user!.email! }});
    if (!user || !canEditEvent(event, user.id, user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    console.log("Parsed data:", JSON.stringify(parsed.data, null, 2));

    // Convert datetime-local format to proper ISO format for Prisma
    const updateData = { ...parsed.data };
    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt);
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt);
    }

    const updated = await prisma.event.update({ where: { id: params.id }, data: updateData });
    
    // Handle hero image assignment if provided
    if (parsed.data.heroImageId) {
      await prisma.image.update({ where: { id: parsed.data.heroImageId }, data: { eventId: params.id } });
    }
    
    // Return the updated event with hero image included
    const eventWithHero = await prisma.event.findUnique({
      where: { id: params.id },
      include: { heroImage: true }
    });
    
    return NextResponse.json(eventWithHero);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ 
      error: "Failed to update event", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user!.email! }});
  if (!user || !canEditEvent(event, user.id, user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
