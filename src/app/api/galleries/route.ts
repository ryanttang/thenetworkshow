import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";

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

    // Admins and Organizers can see all galleries, others only see their own + standalone
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    // Get all galleries the user can access
    let galleries: any[] = [];
    
    if (canManageAllEvents) {
      // Admins can see all galleries
      galleries = await supabase.findMany("Gallery", {
        orderBy: { createdAt: "desc" },
        select: "*, event:Event(*), images:GalleryImage(*)"
      }) as any[];
    } else {
      // Regular users can see galleries from their events + standalone galleries
      const userEventGalleries = await supabase.findMany("Gallery", {
        where: { "event.ownerId": user.id },
        orderBy: { createdAt: "desc" },
        select: "*, event:Event(*), images:GalleryImage(*)"
      }) as any[];
      
      const standaloneGalleries = await supabase.findMany("Gallery", {
        where: { eventId: null },
        orderBy: { createdAt: "desc" },
        select: "*, event:Event(*), images:GalleryImage(*)"
      }) as any[];
      
      galleries = [...userEventGalleries, ...standaloneGalleries];
    }

    // Transform galleries to match the expected interface
    const transformedGalleries = galleries.map((gallery: any) => ({
      ...gallery,
      description: gallery.description || undefined,
      createdAt: gallery.createdAt,
      images: gallery.images?.map((img: any) => ({
        ...img,
        createdAt: img.createdAt
      })) || []
    }));

    return NextResponse.json({ galleries: transformedGalleries });
  } catch (error) {
    console.error("Error fetching galleries:", error);
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
    const { name, description, eventId, tags, isPublic, images } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: "Gallery name is required" }, { status: 400 });
    }

    // Admins and Organizers can create galleries for any event
    const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";

    // Check if event exists and user has permission to access it (if eventId is provided)
    if (eventId) {
      const eventWhere = canManageAllEvents ? { id: eventId } : { id: eventId, ownerId: user.id };
      const event = await supabase.findUnique("Event", eventWhere) as any;
      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
      }
    }

    // Create gallery using Supabase REST API
    const galleryData = {
      name: name.trim(),
      description: description?.trim() || null,
      eventId: eventId || null,
      tags: tags || [],
      isPublic: isPublic !== false,
    };

    const galleryResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Gallery`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(galleryData)
    });

    if (!galleryResponse.ok) {
      const errorText = await galleryResponse.text();
      console.error("Supabase Gallery creation failed:", {
        status: galleryResponse.status,
        statusText: galleryResponse.statusText,
        errorText,
        galleryData
      });
      return NextResponse.json({ error: "Failed to create gallery" }, { status: 500 });
    }

    const galleryArray = await galleryResponse.json();
    const gallery = galleryArray[0]; // Supabase returns an array

    // Add images to gallery if provided
    if (images && images.length > 0) {
      const galleryImages = images.map((img: any, index: number) => ({
        galleryId: gallery.id,
        imageId: img.id,
        title: img.title || null,
        caption: img.caption || null,
        tags: img.tags || [],
        sortOrder: index,
      }));

      const imagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/GalleryImage`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(galleryImages)
      });

      if (!imagesResponse.ok) {
        console.error("Failed to add images to gallery:", await imagesResponse.text());
      }
    }

    return NextResponse.json({ success: true, gallery });
  } catch (error) {
    console.error("Error creating gallery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, name, description, eventId, tags, isPublic, images } = body;

    // Validate required fields
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "Gallery ID and name are required" }, { status: 400 });
    }

    // Check if gallery exists and user has access to it
    const existingGallery = await supabase.findUnique("Gallery", { 
      id,
      OR: [
        { "event.ownerId": user.id }, // User owns the associated event
        { eventId: null } // Or it's a standalone gallery (anyone can edit)
      ]
    }) as any;

    if (!existingGallery) {
      return NextResponse.json({ error: "Gallery not found or access denied" }, { status: 404 });
    }

    // Check if event exists and user owns it (if eventId is provided)
    if (eventId) {
      const event = await supabase.findUnique("Event", { id: eventId, ownerId: user.id }) as any;
      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
      }
    }

    // Update gallery using Supabase REST API
    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      eventId: eventId || null,
      tags: tags || [],
      isPublic: isPublic !== false,
    };

    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Gallery?id=eq.${id}`, {
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
      console.error("Supabase Gallery update failed:", {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorText,
        updateData
      });
      return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
    }

    const updatedArray = await updateResponse.json();
    const updatedGallery = updatedArray[0]; // Supabase returns an array

    // Update images if provided
    if (images && images.length > 0) {
      // Remove existing images
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/GalleryImage?galleryId=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json'
        }
      });

      // Add new images
      const galleryImages = images.map((img: any, index: number) => ({
        galleryId: id,
        imageId: img.id,
        title: img.title || null,
        caption: img.caption || null,
        tags: img.tags || [],
        sortOrder: index,
      }));

      const imagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/GalleryImage`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(galleryImages)
      });

      if (!imagesResponse.ok) {
        console.error("Failed to update gallery images:", await imagesResponse.text());
      }
    }

    return NextResponse.json({ success: true, gallery: updatedGallery });
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
