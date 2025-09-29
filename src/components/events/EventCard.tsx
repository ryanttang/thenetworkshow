"use client";
import { Box, Button, Heading, HStack, Stack, Text, Image as CImage, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { format } from "date-fns";
import { useRef } from "react";

type Props = {
  id: string;
  slug: string;
  title: string;
  startAt: string | Date;
  locationName?: string | null;
  city?: string | null;
  state?: string | null;
  hero?: any | null; // image.variants
  buttonType?: 'RSVP' | 'BUY_TICKETS';
  ticketUrl?: string | null;
  status?: string;
  onDelete?: () => void;
  onStatusChange?: (eventId: string, newStatus: string) => void;
  showArchiveActions?: boolean;
  isAdminView?: boolean; // New prop to determine if this is admin view
};

export default function EventCard({ 
  id, 
  slug, 
  title, 
  startAt, 
  locationName, 
  city, 
  state, 
  hero, 
  buttonType = 'RSVP', 
  ticketUrl, 
  status,
  onDelete, 
  onStatusChange,
  showArchiveActions = false,
  isAdminView = false // Default to public view
}: Props) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Format the startAt date for display
  const formatStartAt = (date: string | Date) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'MMM dd, yyyy • h:mm a');
    }
    return format(date, 'MMM dd, yyyy • h:mm a');
  };

  // Get image URL with proper fallback logic
  const getImageUrl = (image: any) => {
    if (!image?.variants) {
      return null;
    }
    
    // Use direct S3 URLs first
    if (image.variants?.card?.webpUrl) {
      return image.variants.card.webpUrl;
    }
    if (image.variants?.card?.jpgUrl) {
      return image.variants.card.jpgUrl;
    }
    if (image.variants?.thumb?.webpUrl) {
      return image.variants.thumb.webpUrl;
    }
    if (image.variants?.thumb?.jpgUrl) {
      return image.variants.thumb.jpgUrl;
    }
    if (image.variants?.hero?.webpUrl) {
      return image.variants.hero.webpUrl;
    }
    if (image.variants?.hero?.jpgUrl) {
      return image.variants.hero.jpgUrl;
    }
    
    // Fallback to API route if no direct URLs
    if (image.variants?.card?.webpKey) {
      return `/api/images/${encodeURIComponent(image.variants.card.webpKey)}`;
    }
    if (image.variants?.card?.jpgKey) {
      return `/api/images/${encodeURIComponent(image.variants.card.jpgKey)}`;
    }
    if (image.variants?.thumb?.webpKey) {
      return `/api/images/${encodeURIComponent(image.variants.thumb.webpKey)}`;
    }
    if (image.variants?.thumb?.jpgKey) {
      return `/api/images/${encodeURIComponent(image.variants.thumb.jpgKey)}`;
    }
    
    return null;
  };

  const img = getImageUrl(hero);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      toast({
        title: "Event deleted successfully",
        status: "success",
        duration: 3000,
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      toast({
        title: "Error deleting event",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      onClose();
    }
  };

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' })
      });

      if (!res.ok) {
        throw new Error('Failed to archive event');
      }

      toast({
        title: "Event archived successfully",
        status: "success",
        duration: 3000,
      });

      if (onStatusChange) {
        onStatusChange(id, 'ARCHIVED');
      }
    } catch (error) {
      toast({
        title: "Error archiving event",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleUnarchive = async () => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' })
      });

      if (!res.ok) {
        throw new Error('Failed to unarchive event');
      }

      toast({
        title: "Event unarchived successfully",
        status: "success",
        duration: 3000,
      });

      if (onStatusChange) {
        onStatusChange(id, 'DRAFT');
      }
    } catch (error) {
      toast({
        title: "Error unarchiving event",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    
    const statusColors = {
      DRAFT: 'gray',
      PUBLISHED: 'green',
      ARCHIVED: 'orange'
    };

    return (
      <Badge colorScheme={statusColors[status as keyof typeof statusColors] || 'gray'} variant="subtle">
        {status}
      </Badge>
    );
  };
  
  return (
    <>
      <Box 
        bg="white" 
        borderRadius="2xl" 
        overflow="hidden" 
        boxShadow="lg" 
        border="1px solid"
        borderColor="gray.100"
        _hover={{ 
          boxShadow: "xl", 
          transform: "translateY(-2px)",
          transition: "all 0.3s ease"
        }} 
        transition="all 0.3s ease"
        h="full"
        display="flex"
        flexDirection="column"
      >
        {img && (
          <CImage
            src={img}
            alt={title}
            w="100%"
            h="220px"
            objectFit="cover"
            loading="lazy"
            fallbackSrc="/placeholder-image.svg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.svg";
            }}
          />
        )}
        <Stack p={6} spacing={4} flex={1} display="flex" flexDirection="column">
          <Box flex={1}>
            <HStack justify="space-between" align="start" mb={3}>
              <Heading 
                size="md" 
                noOfLines={2} 
                flex={1}
                color="gray.800"
                lineHeight="1.3"
              >
                {title}
              </Heading>
              {isAdminView && getStatusBadge()}
            </HStack>
            <Text 
              color="gray.600" 
              fontSize="sm" 
              fontWeight="500"
              mb={2}
            >
              {formatStartAt(startAt)}
            </Text>
            <Text 
              color="gray.600" 
              noOfLines={1}
              fontSize="sm"
            >
              {locationName ?? `${city ?? ""}${state ? `, ${state}` : ""}`}
            </Text>
          </Box>
          <HStack pt={2} justify="space-between" align="center">
            {buttonType === 'BUY_TICKETS' && ticketUrl ? (
              <Button 
                as="a"
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="blue" 
                variant="solid" 
                size="md"
                px={6}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
                transition="all 0.2s"
              >
                Buy Tickets
              </Button>
            ) : buttonType === 'RSVP' && ticketUrl ? (
              <Button 
                as="a"
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="green" 
                variant="solid" 
                size="md"
                px={6}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
                transition="all 0.2s"
              >
                RSVP
              </Button>
            ) : null}
            
            <Button 
              as={NextLink} 
              href={isAdminView ? `/events/${id}` : `/events/${slug}`} 
              colorScheme="teal" 
              variant="outline" 
              size="md"
              px={6}
              _hover={{
                transform: "translateY(-1px)",
                shadow: "md"
              }}
              transition="all 0.2s"
            >
              View Details
            </Button>
          </HStack>
          
          {/* Action Buttons */}
          <HStack spacing={2} justify="center">
            {isAdminView && (
              <Button 
                as={NextLink} 
                href={`/dashboard/events/${id}/edit`} 
                colorScheme="blue" 
                variant="ghost" 
                size="sm"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "sm"
                }}
                transition="all 0.2s"
              >
                Edit
              </Button>
            )}
            
            {isAdminView && showArchiveActions ? (
              <Button 
                colorScheme="green" 
                variant="ghost" 
                size="sm"
                onClick={handleUnarchive}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "sm"
                }}
                transition="all 0.2s"
              >
                Unarchive
              </Button>
            ) : isAdminView && (
              <Button 
                colorScheme="orange" 
                variant="ghost" 
                size="sm"
                onClick={handleArchive}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "sm"
                }}
                transition="all 0.2s"
              >
                Archive
              </Button>
            )}
            
            {isAdminView && (
              <Button 
                colorScheme="red" 
                variant="ghost" 
                size="sm"
                onClick={onOpen}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "sm"
                }}
                transition="all 0.2s"
              >
                Delete
              </Button>
            )}
          </HStack>
        </Stack>
      </Box>

      {/* Delete Confirmation Dialog */}
      {isAdminView && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Event
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete "{title}"? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
}
