import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GalleryDetailPage from "@/components/gallery/GalleryDetailPage";
import { GalleryImage, Image } from "@prisma/client";

interface GalleryDetailRouteProps {
  params: {
    id: string;
  };
}

export default async function GalleryDetailRoute({ params }: GalleryDetailRouteProps) {
  const gallery = await prisma.gallery.findUnique({
    where: { 
      id: params.id,
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
    }
  });

  if (!gallery) {
    notFound();
  }

  // Transform gallery to match the expected interface
  const transformedGallery = {
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
  };

  return <GalleryDetailPage gallery={transformedGallery} />;
}
