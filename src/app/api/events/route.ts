import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { createEventSchema } from "@/lib/validation";
import { createSlug } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PUBLISHED";
  const owner = searchParams.get("owner");
  const take = Math.min(parseInt(searchParams.get("limit") ?? "24"), 60);
  const page = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
  const skip = (page - 1) * take;
  const from = searchParams.get("from"); // ISO
  const to = searchParams.get("to");
  const q = searchParams.get("q");

  const where: Prisma.EventWhereInput = { 
    status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" 
  };
  
  // If owner=me, filter by current user's events
  if (owner === "me") {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    where.ownerId = user.id;
  }
  
  if (from || to) {
    where.startAt = { 
      ...(from ? { gte: new Date(from) } : {}), 
      ...(to ? { lte: new Date(to) } : {}) 
    };
  }
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [items, count] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: { heroImage: true },
      skip, take
    }),
    prisma.event.count({ where })
  ]);

  return NextResponse.json({ items, page, pageSize: take, total: count });
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const owner = await prisma.user.findUnique({ where: { email: session.user!.email! }});
  if (!owner) return NextResponse.json({ error: "User not found" }, { status: 401 });
  if (!["ADMIN","ORGANIZER"].includes((owner.role as string))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const slug = createSlug(parsed.data.title);

  // Convert datetime-local format to proper ISO format for Prisma
  const eventData = {
    ...parsed.data,
    slug,
    ownerId: owner.id,
    startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : new Date(),
    endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : null,
    status: parsed.data.status || "DRAFT"
  };

  // Remove undefined values
  Object.keys(eventData).forEach(key => {
    if (eventData[key as keyof typeof eventData] === undefined) {
      delete eventData[key as keyof typeof eventData];
    }
  });

  const event = await prisma.event.create({
    data: eventData
  });

  // Optionally set hero image ownership if provided
  if (parsed.data.heroImageId) {
    await prisma.image.update({ where: { id: parsed.data.heroImageId }, data: { eventId: event.id } });
    await prisma.event.update({ where: { id: event.id }, data: { heroImageId: parsed.data.heroImageId }});
  }

  return NextResponse.json(event, { status: 201 });
}
