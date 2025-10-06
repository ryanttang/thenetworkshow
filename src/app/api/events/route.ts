import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";
import { createEventSchema } from "@/lib/validation";
import { createSlug } from "@/lib/utils";

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

  const supabase = new SupabaseClient(true);
  
  let whereClause: any = { status };
  
  // If owner=me, filter by current user's events
  if (owner === "me") {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    whereClause.ownerId = user.id;
  }
  
  if (from || to) {
    whereClause.startAt = { 
      ...(from ? { gte: from } : {}), 
      ...(to ? { lte: to } : {}) 
    };
  }
  if (q) whereClause.title = { contains: q };

  // Get events with pagination
  const events = await supabase.findMany("Event", {
    where: whereClause,
    orderBy: { startAt: "asc" },
    select: "*, heroImage:Image(*)"
  }) as any[];

  // Get total count
  const total = await supabase.count("Event", whereClause);

  // Apply pagination manually since Supabase REST API doesn't have built-in pagination
  const paginatedEvents = events.slice(skip, skip + take);

  return NextResponse.json({ 
    items: paginatedEvents, 
    page, 
    pageSize: take, 
    total 
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = new SupabaseClient(true);
  const owner = await supabase.findUnique("User", { email: session.user!.email! }) as any;
  if (!owner) return NextResponse.json({ error: "User not found" }, { status: 401 });
  if (!["ADMIN","ORGANIZER"].includes((owner.role as string))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create slug with both title and location name, ensuring uniqueness
  let slug = createSlug(parsed.data.title, parsed.data.locationName);
  let counter = 1;
  
  // Ensure slug is unique by appending numbers if needed
  while (true) {
    const existing = await supabase.findUnique("Event", { slug }) as any;
    
    if (!existing) {
      break;
    }
    
    slug = `${createSlug(parsed.data.title, parsed.data.locationName)}-${counter}`;
    counter++;
  }

  // Convert datetime-local format to proper ISO format
  const eventData = {
    ...parsed.data,
    slug,
    ownerId: owner.id,
    startAt: parsed.data.startAt ? new Date(parsed.data.startAt).toISOString() : new Date().toISOString(),
    endAt: parsed.data.endAt ? new Date(parsed.data.endAt).toISOString() : null,
    status: parsed.data.status || "DRAFT"
  };

  // Remove undefined values
  Object.keys(eventData).forEach(key => {
    if (eventData[key as keyof typeof eventData] === undefined) {
      delete eventData[key as keyof typeof eventData];
    }
  });

  // Create event using Supabase REST API
  const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Event`, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(eventData)
  });

  if (!eventResponse.ok) {
    const errorText = await eventResponse.text();
    console.error("Supabase Event creation failed:", {
      status: eventResponse.status,
      statusText: eventResponse.statusText,
      errorText,
      eventData
    });
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }

  const eventArray = await eventResponse.json();
  const event = eventArray[0]; // Supabase returns an array

  // Optionally set hero image ownership if provided
  if (parsed.data.heroImageId) {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Image?id=eq.${parsed.data.heroImageId}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventId: event.id })
    });
    
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Event?id=eq.${event.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ heroImageId: parsed.data.heroImageId })
    });
  }

  return NextResponse.json(event, { status: 201 });
}
