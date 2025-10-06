export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        event: true,
        images: true,
      }
    });

    // Flatten all images from all galleries
    const allImages = galleries.flatMap((gallery: any) => 
      gallery.images?.map((img: any) => ({
        ...img,
        galleryName: gallery.name,
        galleryId: gallery.id,
        eventTitle: gallery.event?.title,
        createdAt: img.createdAt
      })) || []
    );

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
