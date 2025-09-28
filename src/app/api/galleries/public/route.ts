import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all public galleries with their images
    const galleries = await prisma.gallery.findMany({
      where: {
        isPublic: true
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

    // Flatten all images from all galleries
    const allImages = galleries.flatMap(gallery => 
      gallery.images.map(img => ({
        ...img,
        galleryName: gallery.name,
        galleryId: gallery.id,
        eventTitle: gallery.event?.title,
        createdAt: img.createdAt.toISOString()
      }))
    );

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

    return NextResponse.json({ 
      galleries: transformedGalleries,
      allImages 
    });
  } catch (error) {
    console.error("Error fetching public galleries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
