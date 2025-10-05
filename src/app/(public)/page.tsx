import EventGrid from "@/components/events/EventGrid";
import VideoSlider from "@/components/videos/VideoSlider";
import GalleryPreview from "@/components/gallery/GalleryPreview";
import SubscribeForm from "@/components/SubscribeForm";
import { EventGridSkeleton, VideoSliderSkeleton, GalleryPreviewSkeleton, SubscribeFormSkeleton } from "@/components/ui/SkeletonLoader";
import BackToTopButton from "@/components/ui/BackToTopButton";
import { Box, Heading, Container, VStack, Text, Button, HStack, Image } from "@chakra-ui/react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "The Network Show - Premier Cannabis Trade Show",
  description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
  keywords: [
    "cannabis trade show",
    "marijuana trade show",
    "cannabis industry",
    "cannabis networking",
    "cannabis business",
    "cannabis events",
    "cannabis expo",
    "cannabis conference",
    "cannabis professionals",
    "cannabis marketplace"
  ],
  openGraph: {
    title: "The Network Show - Premier Cannabis Trade Show",
    description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
    url: 'https://thenetworkshow.com',
    images: [
      {
        url: '/network-photos.jpg',
        width: 1200,
        height: 630,
        alt: 'The Network Show - Premier Cannabis Trade Show',
      },
    ],
  },
  twitter: {
    title: "The Network Show - Premier Cannabis Trade Show",
    description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
  },
  alternates: {
    canonical: '/',
  },
};

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // For build time, we'll show an empty state
  // In production, this will be populated from the API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let eventsData = { items: [] };
  let videosData = { videos: [] };
  let galleryData = { allImages: [] };
  
  // Only fetch data if we're not in build mode and have database connection
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  if (!isBuildTime && process.env.DATABASE_URL) {
    try {
      const [eventsRes, videosRes, galleryRes] = await Promise.all([
        fetch(`${baseUrl}/api/events?status=PUBLISHED&limit=30`, { 
          next: { revalidate: 60 } 
        }),
        fetch(`${baseUrl}/api/videos?published=true&limit=10`, { 
          next: { revalidate: 60 } 
        }),
        fetch(`${baseUrl}/api/galleries/public`, { 
          next: { revalidate: 60 } 
        })
      ]);
      
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }
      if (videosRes.ok) {
        videosData = await videosRes.json();
      }
      if (galleryRes.ok) {
        galleryData = await galleryRes.json();
      }
    } catch (error) {
      console.log('Error fetching data during build:', error);
    }
  }
  
  return (
    <VStack spacing={0} align="stretch">
      {/* Instagram Follow Button */}
      <Box 
        bg="white"
        py={{ base: 6, md: 8 }}
        textAlign="center"
      >
        <Container maxW="7xl">
          <Button
            as="a"
            href="https://instagram.com/thenetworkshow"
            target="_blank"
            rel="noopener noreferrer"
            size={{ base: "md", md: "lg" }}
            bgGradient="linear(135deg, #833AB4, #C13584, #E1306C, #F56040, #F77737, #FCAF45, #FFDC80)"
            color="white"
            px={{ base: 6, md: 8 }}
            py={{ base: 4, md: 6 }}
            borderRadius="xl"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="600"
            shadow="lg"
            _hover={{
              bgGradient: "linear(135deg, #6A2C93, #A02A6B, #C13584, #E1306C, #F56040, #F77737, #FCAF45)",
              transform: "translateY(-2px)",
              shadow: "xl"
            }}
            _active={{
              transform: "translateY(0px)"
            }}
            transition="all 0.3s ease"
            maxW={{ base: "320px", md: "450px" }}
            mx="auto"
            leftIcon={
              <Image
                src="/Instagram_icon.png"
                alt="Instagram"
                w="20px"
                h="20px"
                objectFit="contain"
              />
            }
          >
            Follow @THENETWORKSHOW
          </Button>
        </Container>
      </Box>

      {/* Upcoming Events Section */}
      <Box 
        bg="white"
        py={{ base: 8, md: 12 }}
        position="relative"
      >
        <Container maxW="7xl" position="relative" zIndex={1}>
          <Box mb={{ base: 8, md: 12 }} display="flex" justifyContent="space-between" alignItems="center">
            <Heading 
              size={{ base: "md", md: "xl" }} 
              color="black"
              fontWeight="600"
              letterSpacing="tight"
              fontFamily="'SUSE Mono', monospace"
            >
              Trade Show Events
            </Heading>
            <Box
              position="relative"
              display="inline-block"
              px={5}
              py={2}
              borderRadius="xl"
              border="2px solid"
              borderColor="black"
              bg="white"
            >
              <Heading 
                size={{ base: "md", md: "xl" }} 
                color="black"
                fontWeight="600"
                letterSpacing="tight"
                fontFamily="'SUSE Mono', monospace"
              >
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Heading>
            </Box>
          </Box>
          <Suspense fallback={<EventGridSkeleton />}>
            <EventGrid items={eventsData.items || []} />
          </Suspense>
          <Box textAlign="center" mt={8}>
            <Link href="/events">
              <Box
                as="button"
                bgGradient="linear(135deg, green.500, green.600)"
                color="white"
                px={{ base: 6, md: 8 }}
                py={{ base: 3, md: 4 }}
                borderRadius="xl"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                shadow="lg"
                _hover={{
                  bgGradient: "linear(135deg, green.600, green.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl"
                }}
                transition="all 0.3s ease"
              >
                View All Events
              </Box>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Recent Events Video Section */}
      <Box 
        bg="gray.50" 
        py={{ base: 8, md: 12 }}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 51, 234, 0.03) 100%)",
          zIndex: 0
        }}
      >
        <Suspense fallback={<VideoSliderSkeleton />}>
          {videosData.videos && videosData.videos.length > 0 ? (
            <VideoSlider videos={videosData.videos} />
          ) : (
            <VideoSliderSkeleton />
          )}
        </Suspense>
      </Box>

      {/* Gallery Section */}
      <Box 
        bgGradient="linear(135deg, purple.50, pink.50, white)"
        py={{ base: 8, md: 12 }}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)",
          zIndex: 0
        }}
      >
        <Suspense fallback={<GalleryPreviewSkeleton />}>
          <GalleryPreview images={galleryData.allImages || []} />
        </Suspense>
      </Box>

      {/* Subscribe Section */}
      <Box 
        bg="white"
        py={{ base: 4, md: 6 }}
      >
        <Suspense fallback={<SubscribeFormSkeleton />}>
          <SubscribeForm />
        </Suspense>
      </Box>

      {/* Back to Top Button */}
      <BackToTopButton />
    </VStack>
  );
}
