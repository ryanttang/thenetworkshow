"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

interface GalleryImage {
  id: string;
  title?: string | null;
  caption?: string | null;
  tags: string[];
  image: {
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
  event?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  images: GalleryImage[];
  createdAt: string;
}

interface GalleryPageProps {
  galleries: Gallery[];
  allTags: string[];
}

export default function GalleryPage({ galleries, allTags }: GalleryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [selectedInstagramPost, setSelectedInstagramPost] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isInstagramOpen, onOpen: onInstagramOpen, onClose: onInstagramClose } = useDisclosure();

  // Load Instagram posts
  useEffect(() => {
    const loadInstagramPosts = async () => {
      try {
        const response = await fetch('/api/instagram/posts');
        if (response.ok) {
          const data = await response.json();
          setInstagramPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to load Instagram posts:', error);
      }
    };
    loadInstagramPosts();
  }, []);

  // Get unique events for filtering
  const events = useMemo(() => {
    const eventMap = new Map();
    galleries.forEach(gallery => {
      if (gallery.event) {
        eventMap.set(gallery.event.id, gallery.event);
      }
    });
    return Array.from(eventMap.values());
  }, [galleries]);

  // Filter galleries based on search and filters
  const filteredGalleries = useMemo(() => {
    return galleries.filter(gallery => {
      // Search term filter
      if (searchTerm && !gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !gallery.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Event filter
      if (selectedEvent && gallery.event?.id !== selectedEvent) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => gallery.tags.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [galleries, searchTerm, selectedEvent, selectedTags]);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    onOpen();
  };

  const handleInstagramPostClick = (post: any) => {
    setSelectedInstagramPost(post);
    onInstagramOpen();
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedEvent("");
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
    if (image.variants?.card?.webpKey) {
      return `/api/images/${image.variants.card.webpKey}`;
    }
    if (image.variants?.card?.jpgKey) {
      return `/api/images/${image.variants.card.jpgKey}`;
    }
    return "/placeholder-image.svg";
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            mb={4}
            fontFamily="'SUSE Mono', monospace"
            fontWeight="600"
          >Event Gallery</Heading>
          <Text fontSize="lg" color="gray.600">
            Browse photos from our amazing events and Instagram
          </Text>
        </Box>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>Event Galleries</Tab>
            <Tab>Instagram</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>

              {/* Filters */}
              <Box bg="gray.50" p={6} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  {/* Search */}
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Search</Text>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <span>🔍</span>
                      </InputLeftElement>
                      <Input
                        placeholder="Search galleries and descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Box>

                  {/* Event Filter */}
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Filter by Event</Text>
                    <Select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      placeholder="All Events"
                    >
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {/* Tags Filter */}
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Filter by Tags</Text>
                    <Wrap spacing={2}>
                      {allTags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag
                            size="md"
                            variant={selectedTags.includes(tag) ? "solid" : "outline"}
                            colorScheme={selectedTags.includes(tag) ? "blue" : "gray"}
                            cursor="pointer"
                            onClick={() => addTag(tag)}
                          >
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Selected Tags:</Text>
                      <Wrap spacing={2}>
                        {selectedTags.map((tag) => (
                          <WrapItem key={tag}>
                            <Tag size="md" colorScheme="blue">
                              <TagLabel>{tag}</TagLabel>
                              <TagCloseButton onClick={() => removeTag(tag)} />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}

                  {/* Clear Filters */}
                  {(searchTerm || selectedTags.length > 0 || selectedEvent) && (
                    <Button onClick={clearAllFilters} variant="outline" size="sm">
                      Clear All Filters
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* Results Count */}
              <Text fontSize="lg" fontWeight="semibold">
                {filteredGalleries.length} gallery{filteredGalleries.length !== 1 ? 'ies' : ''} found
              </Text>

              {/* Galleries Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredGalleries.map((gallery) => (
                  <Link key={gallery.id} href={`/gallery/${gallery.id}`} passHref>
                    <Box
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="lg"
                      overflow="hidden"
                      shadow="md"
                      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                    {/* Gallery Header */}
                    <Box p={4} bg="gray.50">
                      <Heading 
                        size="md" 
                        mb={2}
                        fontFamily="'SUSE Mono', monospace"
                        fontWeight="600"
                      >{gallery.name}</Heading>
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
                      <Text color="gray.500" fontSize="xs">
                        {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
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
                          <Box
                            key={img.id}
                            cursor="pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleImageClick(img);
                            }}
                            _hover={{ opacity: 0.8 }}
                            transition="opacity 0.2s"
                          >
                            <Image
                              src={getImageUrl(img.image)}
                              alt={img.title || "Gallery image"}
                              borderRadius="md"
                              objectFit="cover"
                              w="full"
                              h="20"
                              fallbackSrc="/placeholder-image.svg"
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
                  </Box>
                  </Link>
                ))}
              </SimpleGrid>

              {/* No Results */}
              {filteredGalleries.length === 0 && (
                <Box textAlign="center" py={12}>
                  <Text fontSize="lg" color="gray.500">
                    No galleries found matching your criteria
                  </Text>
                  <Button onClick={clearAllFilters} colorScheme="blue" mt={4}>
                    Clear Filters
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {/* Instagram Tab */}
              <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                  <Heading 
                    size="lg" 
                    mb={2}
                    fontFamily="'SUSE Mono', monospace"
                    fontWeight="600"
                  >Instagram Posts</Heading>
                  <Text color="gray.600">
                    Latest posts from our Instagram account
                  </Text>
                </Box>

                {instagramPosts.length > 0 ? (
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                    {instagramPosts.map((post) => (
                      <Box
                        key={post.id}
                        cursor="pointer"
                        onClick={() => handleInstagramPostClick(post)}
                        _hover={{ opacity: 0.8 }}
                        transition="opacity 0.2s"
                      >
                        <Image
                          src={post.mediaUrl}
                          alt={post.caption || "Instagram post"}
                          borderRadius="md"
                          objectFit="cover"
                          w="full"
                          h="48"
                          fallbackSrc="/placeholder-image.svg"
                        />
                        {post.caption && (
                          <Text fontSize="sm" color="gray.600" mt={2} noOfLines={2}>
                            {post.caption}
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          @{post.account.username}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text fontSize="lg" color="gray.500">
                      No Instagram posts available yet
                    </Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedImage && (
              <VStack spacing={4}>
                <Image
                  src={getImageUrl(selectedImage.image)}
                  alt={selectedImage.title || "Gallery image"}
                  borderRadius="md"
                  maxW="full"
                  maxH="96"
                  objectFit="contain"
                  fallbackSrc="/placeholder-image.svg"
                />
                {selectedImage.title && (
                  <Heading 
                    size="md"
                    fontFamily="'SUSE Mono', monospace"
                    fontWeight="600"
                  >{selectedImage.title}</Heading>
                )}
                {selectedImage.caption && (
                  <Text color="gray.600">{selectedImage.caption}</Text>
                )}
                {selectedImage.tags.length > 0 && (
                  <Wrap spacing={2}>
                    {selectedImage.tags.map((tag) => (
                      <WrapItem key={tag}>
                        <Badge colorScheme="blue">{tag}</Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
                <Text fontSize="sm" color="gray.500">
                  {selectedImage.image.width} × {selectedImage.image.height}
                </Text>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Instagram Post Modal */}
      <Modal isOpen={isInstagramOpen} onClose={onInstagramClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedInstagramPost && (
              <VStack spacing={4}>
                <Image
                  src={selectedInstagramPost.mediaUrl}
                  alt={selectedInstagramPost.caption || "Instagram post"}
                  borderRadius="md"
                  maxW="full"
                  maxH="96"
                  objectFit="contain"
                  fallbackSrc="/placeholder-image.svg"
                />
                {selectedInstagramPost.caption && (
                  <Text color="gray.600" textAlign="center">
                    {selectedInstagramPost.caption}
                  </Text>
                )}
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.500">
                    @{selectedInstagramPost.account.username}
                  </Text>
                  {selectedInstagramPost.takenAt && (
                    <Text fontSize="sm" color="gray.500">
                      {new Date(selectedInstagramPost.takenAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  )}
                </HStack>
                <Button
                  as="a"
                  href={selectedInstagramPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="pink"
                  leftIcon={<span>📷</span>}
                >
                  View on Instagram
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
