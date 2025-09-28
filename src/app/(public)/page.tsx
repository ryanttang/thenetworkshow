import EventGrid from "@/components/events/EventGrid";
import VideoSlider from "@/components/videos/VideoSlider";
import GalleryPreview from "@/components/gallery/GalleryPreview";
import SubscribeForm from "@/components/SubscribeForm";
import { Box, Heading, Container, VStack, Text } from "@chakra-ui/react";

export const revalidate = 60; // ISR

export default async function HomePage() {
  // For build time, we'll show an empty state
  // In production, this will be populated from the API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let eventsData = { items: [] };
  let videosData = { videos: [] };
  let galleryData = { allImages: [] };
  
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
  
  return (
    <VStack spacing={0} align="stretch">
      {/* Subscribe Section */}
      <SubscribeForm />

      {/* Upcoming Events Section */}
      <Container maxW="7xl" py={16}>
        <Box mb={8}>
          <Heading size="2xl" textAlign="center" mb={4}>
            Upcoming Events
          </Heading>
          <Box textAlign="center" color="gray.600">
            Discover amazing events happening in Southern California and beyond
          </Box>
        </Box>
        <EventGrid items={eventsData.items || []} />
      </Container>

      {/* Recent Events Video Section */}
      {videosData.videos && videosData.videos.length > 0 && (
        <VideoSlider videos={videosData.videos} />
      )}

      {/* Gallery Section */}
      <GalleryPreview images={galleryData.allImages || []} />
    </VStack>
  );
}
