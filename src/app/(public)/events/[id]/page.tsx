import { Metadata } from "next";
import { Box, Button, Text, Container } from "@chakra-ui/react";
import { format } from "date-fns";
import Link from "next/link";
import { Event } from "@/types";
import EventDetailClient from "@/components/events/EventDetailClient";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

async function getEvent(id: string): Promise<Event | null> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Check if we're in build mode
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  if (isBuildTime) {
    return null;
  }
  
  try {
    // Check if it's a UUID (ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      // Look up by ID
      const res = await fetch(`${baseUrl}/api/events/${id}`, { 
        next: { revalidate: 60 } 
      });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } else {
      // Look up by slug (for public access, published events only)
      const res = await fetch(`${baseUrl}/api/events/slug/${id}`, { 
        next: { revalidate: 60 } 
      });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    }
  } catch (error) {
    console.log('Error fetching event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await getEvent(params.id);
  
  if (!event) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found.",
    };
  }

  const eventDate = format(new Date(event.startAt), "EEEE, MMMM d, yyyy 'at' p");
  const location = event.locationName ? 
    `${event.locationName}${event.city ? `, ${event.city}` : ''}${event.state ? `, ${event.state}` : ''}` : 
    'Location TBD';

  return {
    title: `${event.title} - Cannabis Event`,
    description: `${event.description || `Join us for ${event.title} on ${eventDate} at ${location}.`} Don't miss this exclusive cannabis event.`,
    keywords: [
      "cannabis event",
      "marijuana event",
      "cannabis social gathering",
      "weed event",
      "cannabis meetup",
      event.title.toLowerCase(),
      event.city?.toLowerCase() || "",
      event.state?.toLowerCase() || "",
    ].filter(Boolean),
    openGraph: {
      title: `${event.title} - Cannabis Trade Show Event | The Network Show`,
      description: `${event.description || `Join us for ${event.title} on ${eventDate} at ${location}.`} Don't miss this premier cannabis trade show event.`,
      url: `https://thenetworkshow.com/events/${event.slug}`,
      type: 'website',
      images: event.heroImage?.variants?.hero?.webpUrl ? [
        {
          url: event.heroImage.variants.hero.webpUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ] : [
        {
          url: '/network-photos.jpg',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      title: `${event.title} - Cannabis Trade Show Event | The Network Show`,
      description: `${event.description || `Join us for ${event.title} on ${eventDate} at ${location}.`} Don't miss this premier cannabis trade show event.`,
      images: event.heroImage?.variants?.hero?.webpUrl ? [event.heroImage.variants.hero.webpUrl] : ['/network-photos.jpg'],
    },
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetail({ params }: { params: { id: string }}) {
  const event = await getEvent(params.id);

  if (!event) {
    return (
      <Container maxW="4xl" py={8}>
        <Box textAlign="center" py={20}>
          <Text fontSize="xl" color="red.500" mb={4}>Event not found</Text>
          <Button as={Link} href="/" colorScheme="blue" variant="outline">
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return <EventDetailClient event={event} />;
}
