import { prisma } from "@/lib/prisma";
import { Box, Button, Heading, Image as CImage, Stack, Text, Container, Badge, HStack, VStack } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EventDetail({ params }: { params: { slug: string }}) {
  const event = await prisma.event.findUnique({ 
    where: { slug: params.slug }, 
    include: { heroImage: true } 
  });
  
  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  const variants = event.heroImage?.variants as any;
  const hero = variants?.hero ?? variants?.card;
  const img = hero?.webpUrl ?? hero?.jpgUrl;

  return (
    <Container maxW="4xl" py={8}>
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
                <Badge colorScheme="teal" size="lg">
                  {event.status}
                </Badge>
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

            {event.ticketUrl && (
              <Button 
                as="a" 
                href={event.ticketUrl} 
                target="_blank" 
                colorScheme="teal" 
                size="lg"
                w="fit-content"
              >
                Buy Tickets
              </Button>
            )}
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}
