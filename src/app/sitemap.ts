import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { Event, Gallery } from '@prisma/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thenetworkshow.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/instagram`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic event pages
  let eventPages: MetadataRoute.Sitemap = []
  
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        updatedAt: true,
        startAt: true,
      },
      orderBy: {
        startAt: 'desc',
      },
    })

    eventPages = events.map((event: Pick<Event, 'slug' | 'updatedAt' | 'startAt'>) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.log('Error fetching events for sitemap:', error)
  }

  // Dynamic gallery pages
  let galleryPages: MetadataRoute.Sitemap = []
  
  try {
    const galleries = await prisma.gallery.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    galleryPages = galleries.map((gallery: Pick<Gallery, 'id' | 'updatedAt'>) => ({
      url: `${baseUrl}/gallery/${gallery.id}`,
      lastModified: gallery.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.log('Error fetching galleries for sitemap:', error)
  }

  return [...staticPages, ...eventPages, ...galleryPages]
}
