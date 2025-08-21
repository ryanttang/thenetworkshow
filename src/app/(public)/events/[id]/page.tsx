"use client";

import { useState, useEffect } from "react";
import { Box, Button, Heading, Image as CImage, Text, Container, HStack, VStack } from "@chakra-ui/react";
import { format } from "date-fns";
import Link from "next/link";
import { Event } from "@/types";

export default function EventDetail({ params }: { params: { id: string }}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Check if it's a UUID (ID) or slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
        
        if (isUUID) {
          // Look up by ID
          const res = await fetch(`/api/events/${params.id}`);
          if (!res.ok) {
            throw new Error('Event not found');
          }
          const eventData = await res.json();
          setEvent(eventData);
        } else {
          // Look up by slug (for public access, published events only)
          const res = await fetch(`/api/events/slug/${params.id}`);
          if (!res.ok) {
            throw new Error('Event not found');
          }
          const eventData = await res.json();
          setEvent(eventData);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Box textAlign="center" py={20}>
          <Text fontSize="xl" color="gray.500">Loading event...</Text>
        </Box>
      </Container>
    );
  }

  if (error || !event) {
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
      {/* Back to Home Button */}
      <Box mb={6}>
        <Button 
          as={Link} 
          href="/" 
          colorScheme="gray" 
          variant="outline" 
          size="md"
          leftIcon={<Text fontSize="sm">←</Text>}
          _hover={{
            transform: "translateY(-1px)",
            shadow: "md"
          }}
          transition="all 0.2s"
        >
          Back to Home
        </Button>
      </Box>

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
            ) : event.buttonType === 'RSVP' ? (
              <Button 
                colorScheme="green" 
                variant="solid" 
                size="lg"
                w="fit-content"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
                transition="all 0.2s"
                onClick={() => {
                  // TODO: Implement RSVP functionality
                  alert('RSVP functionality coming soon!');
                }}
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
