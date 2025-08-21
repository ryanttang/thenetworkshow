import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import GalleryManagement from "@/components/gallery/GalleryManagement";

export default async function GalleryManagementPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  // Get user's events for gallery creation
  const events = await prisma.event.findMany({ 
    where: { ownerId: me.id }, 
    select: { id: true, title: true, slug: true },
    orderBy: { startAt: 'desc' }
  });

  // Get all galleries the user can access (owned events + standalone galleries)
  const galleries = await prisma.gallery.findMany({
    where: {
      OR: [
        { event: { ownerId: me.id } }, // Galleries from user's events
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

  return <GalleryManagement events={events} galleries={transformedGalleries} />;
}
