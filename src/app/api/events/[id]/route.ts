import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validation";
import { canEditEvent } from "@/lib/rbac";
import { createSlug } from "@/lib/utils";

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string }}
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Use Supabase REST API to fetch event
    const supabase = new SupabaseClient(true);
    const event = await supabase.findUnique("Event", { id }) as any;
    
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

    const supabase = new SupabaseClient(true);
    const event = await supabase.findUnique("Event", { id: params.id }) as any;
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await supabase.findUnique("User", { email: session.user!.email! }) as any;
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

    // If title or locationName is being updated, regenerate the slug
    if (parsed.data.title || parsed.data.locationName) {
      // Get current title and locationName (use updated values or fall back to existing)
      const newTitle = parsed.data.title || event.title;
      const newLocationName = parsed.data.locationName || event.locationName;
      
      // Create new slug with both title and location name
      let slug = createSlug(newTitle, newLocationName);
      let counter = 1;
      
      // Ensure slug is unique by appending numbers if needed
      while (true) {
        const existing = await supabase.findUnique("Event", { slug }) as any;
        
        if (!existing || existing.id === params.id) {
          break;
        }
        
        slug = `${createSlug(newTitle, newLocationName)}-${counter}`;
        counter++;
      }
      
      // Add the new slug to updateData
      parsed.data.slug = slug;
    }

    // Convert datetime-local format to proper ISO format
    const updateData: any = { ...parsed.data };
    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt).toISOString();
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt).toISOString();
    }

    // Update event using Supabase REST API
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Event?id=eq.${params.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Supabase Event update failed:", {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorText,
        updateData
      });
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }

    const updatedArray = await updateResponse.json();
    const updated = updatedArray[0]; // Supabase returns an array
    
    // Handle hero image assignment/removal
    if (parsed.data.heroImageId !== undefined) {
      if (parsed.data.heroImageId) {
        // Assign new hero image
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Image?id=eq.${parsed.data.heroImageId}`, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ eventId: params.id })
        });
      } else {
        // Remove hero image (heroImageId is empty string)
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Event?id=eq.${params.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ heroImageId: null })
        });
      }
    }
    
    // Return the updated event
    const eventWithHero = await supabase.findUnique("Event", { id: params.id }) as any;
    
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

  const supabase = new SupabaseClient(true);
  const event = await supabase.findUnique("Event", { id: params.id }) as any;
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await supabase.findUnique("User", { email: session.user!.email! }) as any;
  if (!user || !canEditEvent(event, user.id, user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete event using Supabase REST API
  const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Event?id=eq.${params.id}`, {
    method: 'DELETE',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      'Content-Type': 'application/json'
    }
  });

  if (!deleteResponse.ok) {
    const errorText = await deleteResponse.text();
    console.error("Supabase Event deletion failed:", {
      status: deleteResponse.status,
      statusText: deleteResponse.statusText,
      errorText
    });
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
