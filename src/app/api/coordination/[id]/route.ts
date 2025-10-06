import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";
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
  slug: z.string().optional(),
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

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get coordination with event relationship
    const coordination = await supabase.findUnique("Coordination", { 
      id: params.id,
      "event.ownerId": user.id
    }) as any;

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

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData = updateCoordinationSchema.parse(body);

    // Verify the coordination belongs to the user
    const existingCoordination = await supabase.findUnique("Coordination", { 
      id: params.id,
      "event.ownerId": user.id
    }) as any;

    if (!existingCoordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    let newEvent = null;
    
    // If eventId is being updated, verify the new event exists and user has permission
    if (updateData.eventId && updateData.eventId !== existingCoordination.eventId) {
      const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";
      
      const eventWhere = canManageAllEvents ? { id: updateData.eventId } : { id: updateData.eventId, ownerId: user.id };
      newEvent = await supabase.findUnique("Event", eventWhere) as any;

      if (!newEvent) {
        return NextResponse.json({ error: "Event not found or permission denied" }, { status: 404 });
      }
    }

    // If title or event is being updated, regenerate the slug
    if (updateData.title || updateData.eventId) {
      // Create slug from event title and coordination title
      const createSlug = (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };

      // Get the event (either updated or existing)
      const eventForSlug = newEvent || await supabase.findUnique("Event", { 
        id: newEvent?.id || existingCoordination.eventId 
      }) as any;
      
      if (!eventForSlug) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Use updated title or existing title
      const coordinationTitle = updateData.title || existingCoordination.title;
      
      // Combine event title and coordination title for the slug
      const combinedTitle = `${eventForSlug.title} ${coordinationTitle}`;
      const baseSlug = createSlug(combinedTitle);
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique by appending numbers if needed
      while (true) {
        const existing = await supabase.findUnique("Coordination", { slug }) as any;
        
        if (!existing || existing.id === params.id) {
          break;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Add the new slug to updateData
      updateData.slug = slug;
    }

    // Update coordination using Supabase REST API
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Coordination?id=eq.${params.id}`, {
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
      console.error("Supabase Coordination update failed:", {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorText,
        updateData
      });
      return NextResponse.json({ error: "Failed to update coordination" }, { status: 500 });
    }

    const coordinationArray = await updateResponse.json();
    const coordination = coordinationArray[0]; // Supabase returns an array

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

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the coordination belongs to the user
    const existingCoordination = await supabase.findUnique("Coordination", { 
      id: params.id,
      "event.ownerId": user.id
    }) as any;

    if (!existingCoordination) {
      return NextResponse.json({ error: "Coordination not found" }, { status: 404 });
    }

    // Delete coordination using Supabase REST API
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Coordination?id=eq.${params.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error("Supabase Coordination deletion failed:", {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        errorText
      });
      return NextResponse.json({ error: "Failed to delete coordination" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coordination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
