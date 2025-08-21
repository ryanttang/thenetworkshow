import { prisma } from "@/lib/prisma";
import GalleryPage from "@/components/gallery/GalleryPage";

export default async function GalleryRoute() {
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
  const transformedGalleries = galleries.map(gallery => ({
    ...gallery,
    description: gallery.description || undefined,
    createdAt: gallery.createdAt.toISOString(),
    images: gallery.images.map(img => ({
      ...img,
      title: img.title || undefined,
      caption: img.caption || undefined,
      createdAt: img.createdAt.toISOString()
    }))
  }));

  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(
      transformedGalleries.flatMap(gallery => [
        ...gallery.tags,
        ...gallery.images.flatMap(img => img.tags)
      ])
    )
  ).sort();

  return <GalleryPage galleries={transformedGalleries} allTags={allTags} />;
}
