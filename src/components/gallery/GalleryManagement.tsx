"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Divider,
  Flex,
  Spacer,
} from "@chakra-ui/react";
// Icons replaced with emojis to fix Chakra UI compatibility issues
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/events/ImageUploader";

interface Event {
  id: string;
  title: string;
  slug: string;
}

interface GalleryImage {
  id: string;
  title?: string | null;
  caption?: string | null;
  tags: string[];
  sortOrder: number;
  image: {
    id: string;
    variants: any;
    width: number;
    height: number;
  };
}

interface Gallery {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  event?: Event | null;
  images: GalleryImage[];
  isPublic: boolean;
  createdAt: string;
}

interface GalleryManagementProps {
  events: Event[];
  galleries: Gallery[];
}

export default function GalleryManagement({ events, galleries }: GalleryManagementProps) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventId: "",
    tags: [] as string[],
    isPublic: true,
  });
  const [newTag, setNewTag] = useState("");
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const handleCreateGallery = () => {
    setSelectedGallery(null);
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      eventId: "",
      tags: [],
      isPublic: true,
    });
    setUploadedImages([]);
    setSelectedImages([]);
    onOpen();
  };

  const handleEditGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setIsEditing(true);
    setFormData({
      name: gallery.name,
      description: gallery.description || "",
      eventId: gallery.event?.id || "",
      tags: [...gallery.tags],
      isPublic: gallery.isPublic,
    });
    setUploadedImages([]);
    setSelectedImages([]);
    onOpen();
  };

  const handleViewGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setIsEditing(false);
    setFormData({
      name: gallery.name,
      description: gallery.description || "",
      eventId: gallery.event?.id || "",
      tags: [...gallery.tags],
      isPublic: gallery.isPublic,
    });
    setUploadedImages([]);
    setSelectedImages([]);
    onOpen();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Gallery name is required",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const response = await fetch("/api/galleries", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedGallery?.id,
          ...formData,
          images: selectedImages,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Gallery ${isEditing ? "updated" : "created"} successfully`,
          status: "success",
          duration: 3000,
        });
        onClose();
        router.refresh();
      } else {
        throw new Error("Failed to save gallery");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save gallery",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm("Are you sure you want to delete this gallery?")) return;

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Gallery deleted successfully",
          status: "success",
          duration: 3000,
        });
        router.refresh();
      } else {
        throw new Error("Failed to delete gallery");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleImageUpload = (images: any[]) => {
    setUploadedImages(images);
    setSelectedImages(images);
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Gallery Management</Heading>
            <Text color="gray.600">Create and manage photo galleries for your events</Text>
          </Box>
          <Button
                            leftIcon={<Text fontSize="sm">➕</Text>}
            colorScheme="teal"
            size="lg"
            onClick={handleCreateGallery}
          >
            Create Gallery
          </Button>
        </HStack>

        {/* Galleries Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {galleries.map((gallery) => (
            <Box
              key={gallery.id}
              border="1px"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
              shadow="md"
            >
              {/* Gallery Header */}
              <Box p={4} bg="gray.50">
                <Heading size="md" mb={2}>{gallery.name}</Heading>
                {gallery.event && (
                  <Text color="blue.600" fontSize="sm" mb={2}>
                    Event: {gallery.event.title}
                  </Text>
                )}
                {gallery.description && (
                  <Text color="gray.600" fontSize="sm" mb={2}>
                    {gallery.description}
                  </Text>
                )}
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme={gallery.isPublic ? "green" : "gray"}>
                    {gallery.isPublic ? "Public" : "Private"}
                  </Badge>
                  <Text color="gray.500" fontSize="xs">
                    {new Date(gallery.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </Box>

              {/* Gallery Tags */}
              {gallery.tags.length > 0 && (
                <Box p={4} pt={0}>
                  <Wrap spacing={2}>
                    {gallery.tags.map((tag) => (
                      <WrapItem key={tag}>
                        <Badge colorScheme="blue" variant="subtle">
                          {tag}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

              {/* Gallery Images Preview */}
              <Box p={4} pt={0}>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  {gallery.images.length} photo{gallery.images.length !== 1 ? 's' : ''}
                </Text>
                <SimpleGrid columns={3} spacing={2}>
                  {gallery.images.slice(0, 6).map((img) => (
                    <Box key={img.id}>
                      <Image
                        src={img.image.variants?.thumb?.key || img.image.variants?.card?.key}
                        alt={img.title || "Gallery image"}
                        borderRadius="md"
                        objectFit="cover"
                        w="full"
                        h="20"
                      />
                    </Box>
                  ))}
                  {gallery.images.length > 6 && (
                    <Box
                      bg="gray.200"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      h="20"
                    >
                      <Text fontSize="xs" color="gray.600">
                        +{gallery.images.length - 6} more
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>

              {/* Action Buttons */}
              <Box p={4} pt={0}>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="View gallery"
                    icon={<Text fontSize="sm">👁️</Text>}
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewGallery(gallery)}
                  />
                  <IconButton
                    aria-label="Edit gallery"
                    icon={<Text fontSize="sm">✏️</Text>}
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditGallery(gallery)}
                  />
                  <IconButton
                    aria-label="Delete gallery"
                    icon={<Text fontSize="sm">🗑️</Text>}
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => handleDeleteGallery(gallery.id)}
                  />
                </HStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {/* No Galleries */}
        {galleries.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              You haven't created any galleries yet
            </Text>
            <Button onClick={handleCreateGallery} colorScheme="teal">
              Create Your First Gallery
            </Button>
          </Box>
        )}
      </VStack>

      {/* Gallery Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Gallery" : selectedGallery ? "View Gallery" : "Create Gallery"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Basic Info */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Gallery Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter gallery name"
                    isDisabled={!isEditing}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Event</FormLabel>
                  <Select
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    placeholder="Select event (optional)"
                    isDisabled={!isEditing}
                  >
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter gallery description"
                  rows={3}
                  isDisabled={!isEditing}
                />
              </FormControl>

              {/* Tags */}
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <HStack>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    isDisabled={!isEditing}
                  />
                  <Button onClick={addTag} isDisabled={!isEditing}>
                    Add
                  </Button>
                </HStack>
                {formData.tags.length > 0 && (
                  <Wrap spacing={2} mt={2}>
                    {formData.tags.map((tag) => (
                      <WrapItem key={tag}>
                        <Tag size="md" colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                          {isEditing && (
                            <TagCloseButton onClick={() => removeTag(tag)} />
                          )}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              {/* Public/Private Toggle */}
              <FormControl>
                <FormLabel>Visibility</FormLabel>
                <Select
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "public" })}
                  isDisabled={!isEditing}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </Select>
              </FormControl>

              {/* Image Upload */}
              {isEditing && (
                <>
                  <Divider />
                  <Box>
                    <FormLabel>Upload Images</FormLabel>
                    <ImageUploader
                      onUploaded={(imageId, variants) => {
                        // Handle individual image uploads
                        const newImage = { id: imageId, variants };
                        setSelectedImages([...selectedImages, newImage]);
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <Box>
                  <FormLabel>Selected Images ({selectedImages.length})</FormLabel>
                  <SimpleGrid columns={4} spacing={2}>
                    {selectedImages.map((img, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={img.variants?.thumb?.key || img.variants?.card?.key}
                          alt={`Selected image ${index + 1}`}
                          borderRadius="md"
                          objectFit="cover"
                          w="full"
                          h="20"
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button onClick={onClose}>Cancel</Button>
              {isEditing && (
                <Button colorScheme="teal" onClick={handleSubmit}>
                  Save Changes
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
