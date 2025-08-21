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
    // Check if it's a UUID (ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    
    let event;
    if (isUUID) {
      // Look up by ID (for authenticated users)
      event = await prisma.event.findUnique({
        where: { id: params.id },
        include: { heroImage: true, images: true, owner: true }
      });
    } else {
      // Look up by slug (for public access, published events only)
      event = await prisma.event.findUnique({
        where: { 
          slug: params.id,
          status: "PUBLISHED"
        },
        include: { heroImage: true }
      });
    }
    
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
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user!.email! }});
  if (!user || !canEditEvent(event, user.id, user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.event.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
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
