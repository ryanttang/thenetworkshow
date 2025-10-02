"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Badge,
  Wrap,
  WrapItem,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import Link from "next/link";
import { ChevronLeftIcon } from "@chakra-ui/icons";

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

interface GalleryDetailPageProps {
  gallery: Gallery;
}

export default function GalleryDetailPage({ gallery }: GalleryDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header with Back Button */}
        <Flex justify="space-between" align="center">
          <Link href="/gallery" passHref>
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="outline"
              size="sm"
              _hover={{ bg: "gray.50" }}
            >
              Back to Galleries
            </Button>
          </Link>
        </Flex>

        {/* Gallery Info */}
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            mb={4}
            fontFamily="'SUSE Mono', monospace"
            fontWeight="600"
          >{gallery.name}</Heading>
          {gallery.description && (
            <Text fontSize="lg" color="gray.600" mb={4}>
              {gallery.description}
            </Text>
          )}
          {gallery.event && (
            <Text color="blue.600" fontSize="md" mb={2}>
              Event: {gallery.event.title}
            </Text>
          )}
          <Text color="gray.500" fontSize="sm" mb={4}>
            {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })} • {gallery.images.length} photo{gallery.images.length !== 1 ? 's' : ''}
          </Text>
          
          {/* Gallery Tags */}
          {gallery.tags.length > 0 && (
            <Wrap spacing={2} justify="center">
              {gallery.tags.map((tag) => (
                <WrapItem key={tag}>
                  <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                    {tag}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </Box>

        {/* Masonry Grid of Images */}
        <Box>
          <div className="masonry-grid">
            {gallery.images.map((img, index) => (
              <div
                key={img.id}
                className="masonry-item"
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
                  _hover={{ shadow: "lg", transform: "scale(1.02)" }}
                  transition="all 0.2s"
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
                        <Text fontWeight="semibold" fontSize="sm" mb={1}>
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
                    >{selectedImage.title}</Heading>
                  )}
                  {selectedImage.caption && (
                    <Text color="gray.600" mb={3}>{selectedImage.caption}</Text>
                  )}
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
        .masonry-grid {
          column-count: 1;
          column-gap: 16px;
        }
        
        @media (min-width: 640px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        
        @media (min-width: 768px) {
          .masonry-grid {
            column-count: 3;
          }
        }
        
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 4;
          }
        }
        
        @media (min-width: 1280px) {
          .masonry-grid {
            column-count: 5;
          }
        }
        
        .masonry-item {
          display: inline-block;
          width: 100%;
        }
      `}</style>
    </Container>
  );
}
