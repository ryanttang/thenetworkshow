import { Metadata } from "next";
import { Box, Button, Heading, Image as CImage, Text, Container, HStack, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { format } from "date-fns";
import Link from "next/link";
import { Event } from "@/types";
import { EventStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

async function getEvent(id: string): Promise<Event | null> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
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
      title: `${event.title} - Cannabis Event | THC Members Only Club`,
      description: `${event.description || `Join us for ${event.title} on ${eventDate} at ${location}.`} Don't miss this exclusive cannabis event.`,
      url: `https://thcmembersonlyclub.com/events/${event.slug}`,
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
          url: '/thcmembers-banner.png',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      title: `${event.title} - Cannabis Event | THC Members Only Club`,
      description: `${event.description || `Join us for ${event.title} on ${eventDate} at ${location}.`} Don't miss this exclusive cannabis event.`,
      images: event.heroImage?.variants?.hero?.webpUrl ? [event.heroImage.variants.hero.webpUrl] : ['/thcmembers-banner.png'],
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

  const variants = event.heroImage?.variants as any;
  const hero = variants?.hero ?? variants?.card;
  const img = hero?.webpUrl ?? hero?.jpgUrl;

  return (
    <Container maxW="4xl" py={8}>
      {/* Structured Data */}
      <EventStructuredData event={event} />
      <BreadcrumbStructuredData 
        items={[
          { name: "Home", url: "https://thcmembersonlyclub.com" },
          { name: "Events", url: "https://thcmembersonlyclub.com/events" },
          { name: event.title, url: `https://thcmembersonlyclub.com/events/${event.slug}` },
        ]}
      />
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/events">
            Events
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{event.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="lg">
        {img && (
          <CImage 
            src={img} 
            alt={event.title} 
            w="100%" 
            h="400px" 
            objectFit="cover" 
          />
        )}
        
        <Box p={8}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <HStack justify="space-between" align="start" mb={2}>
                <Heading size="xl">{event.title}</Heading>
              </HStack>
              
              <Text color="gray.600" fontSize="lg">
                {format(new Date(event.startAt), "EEEE, MMMM d, yyyy 'at' p")}
              </Text>
              
              {event.endAt && (
                <Text color="gray.600" fontSize="md">
                  Ends: {format(new Date(event.endAt), "EEEE, MMMM d, yyyy 'at' p")}
                </Text>
              )}
            </Box>

            {event.locationName && (
              <Box>
                <Text fontWeight="semibold" mb={1}>Location</Text>
                <Text color="gray.700">
                  {event.locationName}
                  {event.city && `, ${event.city}`}
                  {event.state && `, ${event.state}`}
                </Text>
              </Box>
            )}

            {event.description && (
              <Box>
                <Text fontWeight="semibold" mb={2}>About this event</Text>
                <Text color="gray.700" whiteSpace="pre-wrap">
                  {event.description}
                </Text>
              </Box>
            )}

            {/* Action Button - Buy Tickets or RSVP */}
            {event.buttonType === 'BUY_TICKETS' && event.ticketUrl ? (
              <Button 
                as="a" 
                href={event.ticketUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                colorScheme="blue" 
                variant="solid" 
                size="lg"
                w="fit-content"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
                transition="all 0.2s"
              >
                Buy Tickets
              </Button>
            ) : event.buttonType === 'RSVP' && event.ticketUrl ? (
              <Button 
                as="a" 
                href={event.ticketUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                colorScheme="green" 
                variant="solid" 
                size="lg"
                w="fit-content"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
                transition="all 0.2s"
              >
                RSVP
              </Button>
            ) : null}
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}
