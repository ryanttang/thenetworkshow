"use client";

import { useState, useEffect } from "react";
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
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
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
  onRefresh: () => void;
}

export default function GalleryManagement({ events, galleries, onRefresh }: GalleryManagementProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Instagram state
  const [instagramAccount, setInstagramAccount] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [isLoadingInstagram, setIsLoadingInstagram] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  // Load Instagram account status
  useEffect(() => {
    const checkInstagramAccount = async () => {
      try {
        const response = await fetch('/api/instagram/account');
        if (response.ok) {
          const data = await response.json();
          setInstagramAccount(data.account);
        }
      } catch (error) {
        console.error('Failed to check Instagram account:', error);
      }
    };
    checkInstagramAccount();
  }, []);

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

      setIsSubmitting(true);

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
        onRefresh(); // Use the passed refresh function instead of router.refresh()
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save gallery");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save gallery",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm("Are you sure you want to delete this gallery? This action cannot be undone.")) return;

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
        onRefresh(); // Use the passed refresh function instead of router.refresh()
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete gallery");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete gallery",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleImageUpload = (imageId: string, variants: any) => {
    const newImage = { id: imageId, variants };
    setUploadedImages(prev => [...prev, newImage]);
    setSelectedImages(prev => [...prev, newImage]);
  };

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const getImageUrl = (image: any) => {
    // Use direct S3 URLs instead of going through our API
    if (image.variants?.thumb?.webpUrl) {
      return image.variants.thumb.webpUrl;
    }
    if (image.variants?.thumb?.jpgUrl) {
      return image.variants.thumb.jpgUrl;
    }
    if (image.variants?.card?.webpUrl) {
      return image.variants.card.webpUrl;
    }
    if (image.variants?.card?.jpgUrl) {
      return image.variants.card.jpgUrl;
    }
    if (image.variants?.hero?.webpUrl) {
      return image.variants.hero.webpUrl;
    }
    if (image.variants?.hero?.jpgUrl) {
      return image.variants.hero.jpgUrl;
    }
    // Fallback to our API route if no direct URLs
    if (image.variants?.thumb?.webpKey) {
      return `/api/images/${image.variants.thumb.webpKey}`;
    }
    if (image.variants?.thumb?.jpgKey) {
      return `/api/images/${image.variants.thumb.jpgKey}`;
    }
    return "/placeholder-image.svg";
  };

  const isFormEditable = isEditing || !selectedGallery; // Enable form when creating new gallery or editing

  // Instagram functions
  const handleConnectInstagram = () => {
    window.location.href = '/api/instagram/auth';
  };

  const handleSyncInstagram = async () => {
    setIsLoadingInstagram(true);
    try {
      const response = await fetch('/api/instagram/sync', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Imported ${data.imported} Instagram posts`,
          status: "success",
          duration: 3000,
        });
        onRefresh();
      } else {
        throw new Error('Failed to sync Instagram posts');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync Instagram posts",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingInstagram(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
                    <Heading size="xl" textAlign="center">Gallery Management</Heading>
        <Text color="gray.600" textAlign="center">Create and manage photo galleries for your events</Text>
          </Box>
          <Button
            leftIcon={<span>➕</span>}
            colorScheme="teal"
            size="lg"
            onClick={handleCreateGallery}
          >
            Create Gallery
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>Regular Galleries</Tab>
            <Tab>Instagram</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>

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
                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
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
                          {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
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
                              src={getImageUrl(img.image)}
                              alt={img.title || "Gallery image"}
                              borderRadius="md"
                              objectFit="cover"
                              w="full"
                              h="20"
                              fallbackSrc="/placeholder-image.svg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-image.svg";
                              }}
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
                          icon={<span>👁️</span>}
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewGallery(gallery)}
                        />
                        <IconButton
                          aria-label="Edit gallery"
                          icon={<span>✏️</span>}
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGallery(gallery)}
                        />
                        <IconButton
                          aria-label="Delete gallery"
                          icon={<span>🗑️</span>}
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
            </TabPanel>

            <TabPanel px={0}>
              {/* Instagram Tab */}
              <VStack spacing={6} align="stretch">
                {/* Instagram Account Status */}
                <Box p={6} bg="gray.50" borderRadius="lg">
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Instagram Integration</Heading>
                    
                    {instagramAccount ? (
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Connected as: <strong>@{instagramAccount.username}</strong></Text>
                          <Badge colorScheme="green">Connected</Badge>
                        </HStack>
                        <HStack spacing={3}>
                          <Button
                            colorScheme="blue"
                            onClick={handleSyncInstagram}
                            isLoading={isLoadingInstagram}
                            loadingText="Syncing..."
                          >
                            Sync Posts
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.location.href = '/api/instagram/auth'}
                          >
                            Reconnect
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        <Text color="gray.600">No Instagram account connected</Text>
                        <Button
                          colorScheme="pink"
                          onClick={handleConnectInstagram}
                          leftIcon={<span>📷</span>}
                        >
                          Connect Instagram Account
                        </Button>
                      </VStack>
                    )}
                  </VStack>
                </Box>

                {/* Instagram Posts Preview */}
                {instagramAccount && (
                  <Box>
                    <Heading size="md" mb={4}>Recent Instagram Posts</Heading>
                    <Text color="gray.600" mb={4}>
                      These posts will appear in your public gallery automatically
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                      {/* This would show a preview of Instagram posts */}
                      <Box textAlign="center" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                        <Text fontSize="sm" color="gray.500">
                          Instagram posts will appear here after syncing
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
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
                    isDisabled={!isFormEditable}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Event</FormLabel>
                  <Select
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    placeholder="Select event (optional)"
                    isDisabled={!isFormEditable}
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
                  isDisabled={!isFormEditable}
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
                    isDisabled={!isFormEditable}
                  />
                  <Button onClick={addTag} isDisabled={!isFormEditable}>
                    Add
                  </Button>
                </HStack>
                {formData.tags.length > 0 && (
                  <Wrap spacing={2} mt={2}>
                    {formData.tags.map((tag) => (
                      <WrapItem key={tag}>
                        <Tag size="md" colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                          {isFormEditable && (
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
                  isDisabled={!isFormEditable}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </Select>
              </FormControl>

              {/* Image Upload */}
              {isFormEditable && (
                <>
                  <Divider />
                  <Box>
                    <FormLabel>Upload Images</FormLabel>
                    <ImageUploader
                      onUploaded={handleImageUpload}
                      showUploadedImages={true}
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
                      <Box key={img.id || index} position="relative">
                        <Image
                          src={getImageUrl(img)}
                          alt={`Selected image ${index + 1}`}
                          borderRadius="md"
                          objectFit="cover"
                          w="full"
                          h="20"
                          fallbackSrc="/placeholder-image.svg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.svg";
                          }}
                        />
                        {isFormEditable && (
                          <IconButton
                            aria-label="Remove image"
                            icon={<span>✕</span>}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => removeSelectedImage(img.id)}
                          />
                        )}
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
              {isFormEditable && (
                <Button 
                  colorScheme="teal" 
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                >
                  {isEditing ? "Save Changes" : "Create Gallery"}
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
