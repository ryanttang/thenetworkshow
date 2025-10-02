import { prisma } from "@/lib/prisma";
import GalleryPage from "@/components/gallery/GalleryPage";
import { Gallery, GalleryImage, Image, Event } from "@prisma/client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function GalleryRoute() {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    return <GalleryPage galleries={[]} allTags={[]} />;
  }

  const galleries = await prisma.gallery.findMany({
    where: { isPublic: true },
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
  const transformedGalleries = galleries.map((gallery: Gallery & { 
    event: Pick<Event, 'id' | 'title' | 'slug'> | null; 
    images: (GalleryImage & { image: Image })[] 
  }) => ({
    ...gallery,
    description: gallery.description || undefined,
    createdAt: gallery.createdAt.toISOString(),
    images: gallery.images.map((img: GalleryImage & { image: Image }) => ({
      ...img,
      title: img.title || undefined,
      caption: img.caption || undefined,
      createdAt: img.createdAt.toISOString(),
      image: {
        ...img.image,
        createdAt: img.image.createdAt.toISOString(),
        updatedAt: img.image.updatedAt.toISOString()
      }
    }))
  }));

  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(
      transformedGalleries.flatMap((gallery: any) => [
        ...(gallery.tags as string[]),
        ...gallery.images.flatMap((img: any) => img.tags as string[])
      ])
    )
  ).sort() as string[];

  return <GalleryPage galleries={transformedGalleries} allTags={allTags} />;
}
