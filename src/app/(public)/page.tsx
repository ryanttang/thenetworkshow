import EventGrid from "@/components/events/EventGrid";
import { Box, Heading, Container } from "@chakra-ui/react";

export const revalidate = 60; // ISR

export default async function HomePage() {
  // For build time, we'll show an empty state
  // In production, this will be populated from the API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  let data = { items: [] };
  try {
    const res = await fetch(`${baseUrl}/api/events?status=PUBLISHED&limit=30`, { 
      next: { revalidate: 60 } 
    });
    data = await res.json();
  } catch (error) {
    console.log('Error fetching events during build:', error);
  }
  
  return (
    <Container maxW="7xl" py={8}>
      <Box mb={8}>
        <Heading size="2xl" textAlign="center" mb={4}>
          Upcoming Events
        </Heading>
        <Box textAlign="center" color="gray.600">
          Discover amazing events happening in your area
        </Box>
      </Box>
      <EventGrid items={data.items || []} />
    </Container>
  );
}
