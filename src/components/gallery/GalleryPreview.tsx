"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  VStack,
  SimpleGrid,
  Badge,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

interface GalleryImage {
  id: string;
  title?: string | null;
  caption?: string | null;
  tags: string[];
  galleryName: string;
  galleryId: string;
  eventTitle?: string | null;
  image: {
    variants: any;
    width: number;
    height: number;
  };
  createdAt: string;
}

interface GalleryPreviewProps {
  images: GalleryImage[];
}

export default function GalleryPreview({ images }: GalleryPreviewProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [randomImages, setRandomImages] = useState<GalleryImage[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Select 9 images on component mount (deterministic to avoid hydration mismatch)
  useEffect(() => {
    if (images && images.length > 0) {
      // Use a deterministic approach instead of Math.random() to avoid hydration mismatch
      const shuffled = [...images].sort((a, b) => a.id.localeCompare(b.id));
      setRandomImages(shuffled.slice(0, 9));
    }
  }, [images]);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    onOpen();
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

  const getFullImageUrl = (image: any) => {
    // Use full-size image for modal
    if (image.variants?.hero?.webpUrl) {
      return image.variants.hero.webpUrl;
    }
    if (image.variants?.hero?.jpgUrl) {
      return image.variants.hero.jpgUrl;
    }
    if (image.variants?.card?.webpUrl) {
      return image.variants.card.webpUrl;
    }
    if (image.variants?.card?.jpgUrl) {
      return image.variants.card.jpgUrl;
    }
    // Fallback to our API route if no direct URLs
    if (image.variants?.hero?.webpKey) {
      return `/api/images/${image.variants.hero.webpKey}`;
    }
    if (image.variants?.hero?.jpgKey) {
      return `/api/images/${image.variants.hero.jpgKey}`;
    }
    if (image.variants?.card?.webpKey) {
      return `/api/images/${image.variants.card.webpKey}`;
    }
    if (image.variants?.card?.jpgKey) {
      return `/api/images/${image.variants.card.jpgKey}`;
    }
    return getImageUrl(image);
  };

  if (!images || images.length === 0) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" mb={4} fontFamily="'SUSE Mono', monospace" fontWeight="600">Gallery</Heading>
            <Text fontSize="lg" color="gray.600">
              No images available yet. Check back soon for amazing photos from our events!
            </Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="left">
          <Heading 
            size={{ base: "md", md: "xl" }} 
            color="black"
            fontWeight="600"
            letterSpacing="tight"
            fontFamily="'SUSE Mono', monospace"
          >
            Gallery
          </Heading>
        </Box>

        {/* 3x3 Masonry Grid */}
        <Box>
          <div className="masonry-grid-preview">
            {randomImages.map((img) => (
              <div
                key={img.id}
                className="masonry-item-preview"
                style={{
                  breakInside: "avoid",
                  marginBottom: "16px",
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(img)}
              >
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  shadow="md"
                  border="2px solid"
                  borderColor="transparent"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    right: "-2px",
                    bottom: "-2px",
                    borderRadius: "lg",
                    bgGradient: "linear(135deg, purple.300, pink.300, purple.200)",
                    zIndex: -1
                  }}
                  _after={{
                    content: '""',
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    right: "0px",
                    bottom: "0px",
                    borderRadius: "lg",
                    bgGradient: "linear(135deg, purple.50, pink.50, white)",
                    zIndex: -1
                  }}
                  _hover={{ 
                    shadow: "lg", 
                    transform: "scale(1.02)",
                    _before: {
                      bgGradient: "linear(135deg, purple.400, pink.400, purple.300)"
                    },
                    _after: {
                      bgGradient: "linear(135deg, purple.100, pink.100, white)"
                    }
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  bg="white"
                >
                  <Image
                    src={getImageUrl(img.image)}
                    alt={img.title || "Gallery image"}
                    w="full"
                    h="auto"
                    objectFit="cover"
                    fallbackSrc="/placeholder-image.svg"
                    loading="lazy"
                  />
                  {(img.title || img.caption || img.tags.length > 0) && (
                    <Box p={3}>
                      {img.title && (
                        <Text 
                          fontWeight="600" 
                          fontSize="sm" 
                          mb={1}
                          fontFamily="'SUSE Mono', monospace"
                        >
                          {img.title}
                        </Text>
                      )}
                      {img.caption && (
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          {img.caption}
                        </Text>
                      )}
                      {img.tags.length > 0 && (
                        <Wrap spacing={1}>
                          {img.tags.map((tag) => (
                            <WrapItem key={tag}>
                              <Badge colorScheme="blue" variant="outline" size="sm">
                                {tag}
                              </Badge>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                    </Box>
                  )}
                </Box>
              </div>
            ))}
          </div>
        </Box>

        {/* View All Gallery Link */}
        <Box textAlign="center">
          <Link href="/gallery">
            <Box
              as="button"
              display="inline-block"
              px={8}
              py={4}
              bgGradient="linear(135deg, purple.500, purple.600)"
              color="white"
              borderRadius="xl"
              fontWeight="semibold"
              fontSize="lg"
              _hover={{ 
                bgGradient: "linear(135deg, purple.600, purple.700)", 
                transform: "translateY(-2px)",
                shadow: "xl"
              }}
              transition="all 0.3s ease"
              shadow="lg"
              cursor="pointer"
            >
              View All Photos
            </Box>
          </Link>
        </Box>
      </VStack>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedImage && (
              <VStack spacing={4}>
                <Image
                  src={getFullImageUrl(selectedImage.image)}
                  alt={selectedImage.title || "Gallery image"}
                  borderRadius="md"
                  maxW="full"
                  maxH="80vh"
                  objectFit="contain"
                  fallbackSrc="/placeholder-image.svg"
                />
                <Box textAlign="center">
                  {selectedImage.title && (
                    <Heading 
                      size="md" 
                      mb={2}
                      fontFamily="'SUSE Mono', monospace"
                      fontWeight="600"
                    >
                      {selectedImage.title}
                    </Heading>
                  )}
                  {selectedImage.caption && (
                    <Text color="gray.600" mb={3}>{selectedImage.caption}</Text>
                  )}
                  <Text color="blue.600" fontSize="sm" mb={2}>
                    From: {selectedImage.galleryName}
                    {selectedImage.eventTitle && ` • ${selectedImage.eventTitle}`}
                  </Text>
                  {selectedImage.tags.length > 0 && (
                    <Wrap spacing={2} justify="center" mb={3}>
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
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <style jsx>{`
        .masonry-grid-preview {
          column-count: 3;
          column-gap: 16px;
        }
        
        @media (max-width: 768px) {
          .masonry-grid-preview {
            column-count: 2;
          }
        }
        
        @media (max-width: 480px) {
          .masonry-grid-preview {
            column-count: 2;
          }
        }
        
        .masonry-item-preview {
          display: inline-block;
          width: 100%;
        }
      `}</style>
    </Container>
  );
}
