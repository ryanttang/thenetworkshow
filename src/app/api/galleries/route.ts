import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all galleries the user can access (owned events + standalone galleries)
    const galleries = await prisma.gallery.findMany({
      where: {
        OR: [
          { event: { ownerId: user.id } }, // Galleries from user's events
          { eventId: null } // Standalone galleries
        ]
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        images: {
          include: {
            image: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform galleries to match the expected interface
    const transformedGalleries = galleries.map(gallery => ({
      ...gallery,
      description: gallery.description || undefined,
      createdAt: gallery.createdAt.toISOString(),
      images: gallery.images.map(img => ({
        ...img,
        createdAt: img.createdAt.toISOString()
      }))
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, eventId, tags, isPublic, images } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: "Gallery name is required" }, { status: 400 });
    }

    // Check if event exists and user owns it (if eventId is provided)
    if (eventId) {
      const event = await prisma.event.findFirst({
        where: { id: eventId, ownerId: user.id }
      });
      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
      }
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        eventId: eventId || null,
        tags: tags || [],
        isPublic: isPublic !== false,
      }
    });

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

      await prisma.galleryImage.createMany({
        data: galleryImages
      });
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
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
    const existingGallery = await prisma.gallery.findFirst({
      where: { 
        id,
        OR: [
          { event: { ownerId: user.id } }, // User owns the associated event
          { eventId: null } // Or it's a standalone gallery (anyone can edit)
        ]
      },
      include: { event: true }
    });

    if (!existingGallery) {
      return NextResponse.json({ error: "Gallery not found or access denied" }, { status: 404 });
    }

    // Check if event exists and user owns it (if eventId is provided)
    if (eventId) {
      const event = await prisma.event.findFirst({
        where: { id: eventId, ownerId: user.id }
      });
      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
      }
    }

    // Update gallery
    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        eventId: eventId || null,
        tags: tags || [],
        isPublic: isPublic !== false,
      }
    });

    // Update images if provided
    if (images && images.length > 0) {
      // Remove existing images
      await prisma.galleryImage.deleteMany({
        where: { galleryId: id }
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

      await prisma.galleryImage.createMany({
        data: galleryImages
      });
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
