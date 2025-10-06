import { Metadata } from "next";
import EventGrid from "@/components/events/EventGrid";
import { Box, Heading, Container, VStack, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Trade Show Events - Cannabis Industry Events",
  description: "Discover upcoming cannabis trade show events, industry conferences, and business networking opportunities. Join The Network Show for premier cannabis industry events and professional networking.",
  keywords: [
    "cannabis trade show events",
    "marijuana trade shows",
    "cannabis industry events",
    "cannabis business events",
    "cannabis networking",
    "marijuana industry conferences",
    "cannabis professional events",
    "cannabis expo",
    "cannabis conference",
    "cannabis marketplace"
  ],
  openGraph: {
    title: "Trade Show Events - Cannabis Industry Events | The Network Show",
    description: "Discover upcoming cannabis trade show events, industry conferences, and business networking opportunities. Join The Network Show for premier cannabis industry events and professional networking.",
    url: 'https://thenetworkshow.com/events',
    images: [
      {
        url: '/network-photos.jpg',
        width: 1200,
        height: 630,
        alt: 'The Network Show Trade Show Events',
      },
    ],
  },
  twitter: {
    title: "Trade Show Events - Cannabis Industry Events | The Network Show",
    description: "Discover upcoming cannabis trade show events, industry conferences, and business networking opportunities. Join The Network Show for premier cannabis industry events and professional networking.",
  },
  alternates: {
    canonical: '/events',
  },
};

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let eventsData = { items: [] };
  
  // Only fetch data if we're not in build mode and have database connection
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  if (!isBuildTime && process.env.DATABASE_URL) {
    try {
      const eventsRes = await fetch(`${baseUrl}/api/events?status=PUBLISHED&limit=50`, { 
        next: { revalidate: 60 } 
      });
      
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }
    } catch (error) {
      console.log('Error fetching events during build:', error);
    }
  }
  
  return (
    <Container maxW="7xl" py={8}>
      {/* Structured Data */}
      <BreadcrumbStructuredData 
        items={[
          { name: "Home", url: "https://thenetworkshow.com" },
          { name: "Events", url: "https://thenetworkshow.com/events" },
        ]}
      />
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb mb={8} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Events</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Page Header */}
      <VStack spacing={6} align="stretch" mb={12}>
        <Box textAlign="center">
          <Heading size="2xl" mb={4} color="green.600" fontFamily="'SUSE Mono', monospace" fontWeight="600">
            Events Calendar
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
            Discover amazing cannabis events happening in Southern California and beyond. 
            From exclusive member gatherings to educational workshops, find your next cannabis experience.
          </Text>
        </Box>
        
        {/* SEO Content */}
        <Box bg="gray.50" p={8} borderRadius="xl" mt={8}>
          <VStack spacing={4} align="stretch">
            <Heading size="lg" color="green.600" fontFamily="'SUSE Mono', monospace" fontWeight="600">
              Why Join Our Cannabis Events?
            </Heading>
            <Text color="gray.700">
              Our events calendar features the most exclusive and educational cannabis experiences in Southern California. 
              Whether you&apos;re a seasoned cannabis enthusiast or new to the community, our events offer something for everyone.
            </Text>
            <Box>
              <Heading size="md" mb={2} color="green.600" fontFamily="'SUSE Mono', monospace" fontWeight="600">
                Event Types We Host:
              </Heading>
              <Text color="gray.700" mb={2}>
                • <strong>Educational Workshops:</strong> Learn about cannabis cultivation, consumption methods, and industry trends
              </Text>
              <Text color="gray.700" mb={2}>
                • <strong>Social Gatherings:</strong> Network with like-minded cannabis enthusiasts and industry professionals
              </Text>
              <Text color="gray.700" mb={2}>
                • <strong>Product Launches:</strong> Be the first to try new cannabis products and meet the creators
              </Text>
              <Text color="gray.700" mb={2}>
                • <strong>Community Events:</strong> Participate in cannabis advocacy and community building activities
              </Text>
              <Text color="gray.700">
                • <strong>Industry Networking:</strong> Connect with cannabis industry professionals and business leaders
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>

      {/* Events Grid */}
      <Box>
        <Heading size="lg" mb={6} color="green.600" fontFamily="'SUSE Mono', monospace" fontWeight="600">
          Upcoming Events ({eventsData.items?.length || 0})
        </Heading>
        <EventGrid items={eventsData.items || []} />
      </Box>

      {/* Call to Action */}
      <Box textAlign="center" mt={16} p={8} bg="green.50" borderRadius="xl">
        <Heading size="lg" mb={4} color="green.600" fontFamily="'SUSE Mono', monospace" fontWeight="600">
          Don&apos;t Miss Out on Exclusive Events
        </Heading>
        <Text fontSize="lg" color="gray.700" mb={6}>
          Join The Network Show to get early access to trade show events, industry networking opportunities, and exclusive business connections.
        </Text>
        <Box>
          <Link href="/contact">
            <Box
              as="button"
              bg="green.600"
              color="white"
              px={8}
              py={3}
              borderRadius="lg"
              fontSize="lg"
              fontWeight="semibold"
              _hover={{
                bg: "green.700",
                transform: "translateY(-1px)",
                shadow: "md"
              }}
              transition="all 0.2s"
            >
              Join Our Club
            </Box>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
