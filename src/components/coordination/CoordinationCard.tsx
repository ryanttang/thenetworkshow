"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import CoordinationForm from "./CoordinationForm";
import DocumentUploader from "./DocumentUploader";

interface Event {
  id: string;
  title: string;
  slug: string;
  startAt: Date;
}

interface CoordinationCardProps {
  coordination: {
    id: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    shareToken: string;
    isActive: boolean;
    createdAt: Date;
    event: {
      id: string;
      title: string;
      slug: string;
      startAt: Date;
    };
    documents: any[];
    _count: {
      documents: number;
    };
  };
  events: Event[];
}

export default function CoordinationCard({ coordination, events }: CoordinationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const toast = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this coordination set? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/coordination/${coordination.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete coordination");
      }

      toast({
        title: "Coordination deleted",
        description: "The coordination set has been deleted successfully",
        status: "success",
        duration: 3000,
      });

      // Trigger parent component refresh
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/coordination/${coordination.shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        status: "error",
        duration: 3000,
      });
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      MAP: "🗺️",
      RUN_OF_SHOW: "📋",
      ITINERARY: "📅",
      SCHEDULE: "⏰",
      DIAGRAM: "📊",
      RIDER: "📄",
      NOTES: "📝",
      OTHER: "📎",
    };
    return icons[type] || "📎";
  };

  return (
    <>
      <Card 
        shadow="lg" 
        borderRadius="2xl" 
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        _hover={{
          shadow: "xl",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease"
        }}
        transition="all 0.3s ease"
      >
        <CardHeader pb={4} px={6} pt={6}>
          <VStack align="flex-start" spacing={3}>
            <HStack justify="space-between" w="full">
              <VStack align="flex-start" spacing={1} flex={1}>
                <Heading size="md" color="gray.800" noOfLines={2}>
                  {coordination.title}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {coordination.event.title}
                </Text>
              </VStack>
              <Badge 
                colorScheme={coordination.isActive ? "green" : "gray"} 
                variant="subtle" 
                px={2} 
                py={1} 
                borderRadius="full"
              >
                {coordination.isActive ? "Active" : "Inactive"}
              </Badge>
            </HStack>
            
            {coordination.description && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {coordination.description}
              </Text>
            )}
          </VStack>
        </CardHeader>

        <CardBody pt={0} px={6} pb={6}>
          <VStack align="stretch" spacing={4}>
            {/* Document Count */}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Documents: {coordination._count.documents}
              </Text>
              <Text fontSize="xs" color="gray.400">
                Created {new Date(coordination.createdAt).toLocaleDateString()}
              </Text>
            </HStack>

            {/* Recent Documents */}
            {coordination.documents.length > 0 && (
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
                  Recent Documents:
                </Text>
                <VStack spacing={1} align="stretch">
                  {coordination.documents.slice(0, 3).map((doc: any) => (
                    <HStack key={doc.id} spacing={2}>
                      <Text fontSize="xs">{getDocumentTypeIcon(doc.type)}</Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1}>
                        {doc.title}
                      </Text>
                    </HStack>
                  ))}
                  {coordination.documents.length > 3 && (
                    <Text fontSize="xs" color="gray.400">
                      +{coordination.documents.length - 3} more
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            <Divider />

            {/* Action Buttons */}
            <VStack spacing={2} w="full">
              <HStack spacing={2} w="full">
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="blue"
                  flex={1}
                  onClick={onUploadOpen}
                >
                  Upload Documents
                </Button>
                <Tooltip label="Copy share link">
                  <IconButton
                    aria-label="Copy share link"
                    icon={<span>🔗</span>}
                    size="sm"
                    variant="outline"
                    colorScheme="green"
                    onClick={copyShareLink}
                  />
                </Tooltip>
              </HStack>
              
              <HStack spacing={2} w="full">
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="gray"
                  flex={1}
                  onClick={onOpen}
                >
                  Edit
                </Button>
                <Button 
                  as={Link}
                  href={`/coordination/${coordination.shareToken}`}
                  size="sm" 
                  colorScheme="blue"
                  flex={1}
                  target="_blank"
                >
                  View
                </Button>
                <Tooltip label="Delete coordination">
                  <IconButton
                    aria-label="Delete coordination"
                    icon={<span>🗑️</span>}
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                  />
                </Tooltip>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Coordination Set</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CoordinationForm 
              coordination={coordination}
              events={events}
              onSuccess={() => {
                onClose();
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Document Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <DocumentUploader 
              coordinationId={coordination.id}
              onSuccess={() => {
                onUploadClose();
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
