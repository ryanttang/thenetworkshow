import { MetadataRoute } from 'next'

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

  // Dynamic event pages (via REST to avoid DB at build time)
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${baseUrl}/api/events?status=PUBLISHED&limit=200`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      const items: Array<{ slug: string; updatedAt?: string | Date; startAt?: string | Date }> = data.items || []
      eventPages = items.map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.log('Error fetching events for sitemap:', error)
  }

  // Dynamic gallery pages (via REST)
  let galleryPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${baseUrl}/api/galleries/public`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      const items: Array<{ id: string; updatedAt?: string | Date }> = data.items || data.galleries || []
      galleryPages = items.map((gallery) => ({
        url: `${baseUrl}/gallery/${gallery.id}`,
        lastModified: gallery.updatedAt ? new Date(gallery.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.log('Error fetching galleries for sitemap:', error)
  }

  return [...staticPages, ...eventPages, ...galleryPages]
}
