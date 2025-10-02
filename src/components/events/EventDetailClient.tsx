"use client";
import { useState } from "react";
import { Box, Button, Heading, Image as CImage, Text, Container, HStack, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { format } from "date-fns";
import Link from "next/link";
import { Event } from "@/types";
import { EventStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    onOpen();
  };

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
            h="auto"
            maxH="80vh"
            objectFit="contain" 
          />
        )}
        
        {/* Action Button - Buy Tickets or RSVP - Moved below hero image */}
        {event.buttonType === 'BUY_TICKETS' && event.ticketUrl ? (
          <Box p={6} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
            <Button 
              as="a" 
              href={event.ticketUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              size="lg"
              colorScheme="blue"
              w="full"
              maxW="300px"
            >
              Buy Tickets
            </Button>
          </Box>
        ) : event.buttonType === 'RSVP' && event.ticketUrl ? (
          <Box p={6} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
            <Button 
              as="a" 
              href={event.ticketUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              size="lg"
              colorScheme="green"
              w="full"
              maxW="300px"
            >
              RSVP
            </Button>
          </Box>
        ) : null}
        
        <Box p={8}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <HStack justify="space-between" align="start" mb={2}>
                <Heading size="xl" fontFamily="'SUSE Mono', monospace" fontWeight="600">{event.title}</Heading>
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

            {/* Detail Images */}
            {event.images && event.images.length > 0 && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {event.images.map((image: any) => {
                    const variants = image.variants as any;
                    const imgUrl = variants?.card?.webpUrl ?? variants?.card?.jpgUrl ?? 
                                  variants?.hero?.webpUrl ?? variants?.hero?.jpgUrl ??
                                  variants?.thumb?.webpUrl ?? variants?.thumb?.jpgUrl;
                    
                    return (
                      <Box 
                        key={image.id} 
                        borderRadius="md" 
                        overflow="hidden" 
                        boxShadow="sm"
                        cursor="pointer"
                        transition="transform 0.2s"
                        _hover={{ transform: "scale(1.02)" }}
                        onClick={() => handleImageClick(image)}
                      >
                        <CImage 
                          src={imgUrl || "/placeholder-image.svg"} 
                          alt={`Event detail image`}
                          w="100%" 
                          h="200px" 
                          objectFit="cover"
                          fallbackSrc="/placeholder-image.svg"
                        />
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Back to Home Button */}
      <Box textAlign="center" mt={8}>
        <Button 
          as={Link} 
          href="/" 
          colorScheme="gray" 
          variant="outline"
          size="lg"
        >
          Back to Home
        </Button>
      </Box>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedImage && (
              <Box position="relative">
                <CImage 
                  src={(() => {
                    const variants = selectedImage.variants as any;
                    return variants?.original?.webpUrl ?? variants?.original?.jpgUrl ??
                           variants?.hero?.webpUrl ?? variants?.hero?.jpgUrl ??
                           variants?.card?.webpUrl ?? variants?.card?.jpgUrl ??
                           "/placeholder-image.svg";
                  })()}
                  alt="Enlarged event image"
                  w="100%"
                  h="auto"
                  maxH="80vh"
                  objectFit="contain"
                  fallbackSrc="/placeholder-image.svg"
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
