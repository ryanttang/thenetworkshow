"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  Flex,
  AspectRatio,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import VideoForm from "@/components/videos/VideoForm";
import type { RecentEventVideo } from "@/types";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string => {
  // Handle YouTube Shorts URLs
  if (url.includes('youtube.com/shorts/')) {
    const match = url.match(/youtube\.com\/shorts\/([^?&]+)/);
    return match ? match[1] : '';
  }
  
  // Handle regular YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export default function VideosPage() {
  const [videos, setVideos] = useState<RecentEventVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<RecentEventVideo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos?published=false", {
        credentials: "include",
      });
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch videos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleCreate = () => {
    setSelectedVideo(null);
    onOpen();
  };

  const handleEdit = (video: RecentEventVideo) => {
    setSelectedVideo(video);
    onOpen();
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== videoId));
        toast({
          title: "Success",
          description: "Video deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = async (videoData: any) => {
    try {
      const url = selectedVideo ? `/api/videos/${selectedVideo.id}` : "/api/videos";
      const method = selectedVideo ? "PUT" : "POST";

      console.log("Submitting video data:", videoData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        
        if (selectedVideo) {
          setVideos(videos.map((v) => (v.id === selectedVideo.id ? result.video : v)));
        } else {
          setVideos([...videos, result.video]);
        }

        onClose();
        toast({
          title: "Success",
          description: `Video ${selectedVideo ? "updated" : "created"} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`Failed to save video: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error",
        description: "Failed to save video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Container maxW="7xl">
        <Center py={20}>
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="7xl">
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading 
              size="2xl" 
              mb={2}
              fontFamily="'SUSE Mono', monospace"
              fontWeight="600"
            >
              Recent Event Videos
            </Heading>
            <Text color="gray.600">
              Manage videos for the Recent Events section on the homepage
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreate}
            size="lg"
          >
            Add Video
          </Button>
        </Flex>

        {videos.length === 0 ? (
          <Box textAlign="center" py={20}>
            <Text fontSize="xl" color="gray.500" mb={4}>
              No videos yet
            </Text>
            <Button colorScheme="blue" onClick={handleCreate}>
              Add your first video
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {videos.map((video) => (
              <Card key={video.id} overflow="hidden">
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text 
                        fontWeight="600" 
                        noOfLines={2}
                        fontFamily="'SUSE Mono', monospace"
                      >
                        {video.title}
                      </Text>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={video.isPublished ? "green" : "gray"}
                          size="sm"
                        >
                          {video.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge colorScheme="blue" size="sm">
                          {video.videoType}
                        </Badge>
                      </HStack>
                    </VStack>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Edit video"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(video)}
                      />
                      <IconButton
                        aria-label="Delete video"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(video.id)}
                      />
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    <Box position="relative">
                      <AspectRatio ratio={16 / 9}>
                        {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                          <Box
                            as="iframe"
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.videoUrl)}?autoplay=0&loop=${video.loop ? 1 : 0}&playlist=${video.loop ? getYouTubeVideoId(video.videoUrl) : ''}&mute=${video.muted ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1`}
                            w="100%"
                            h="100%"
                            borderRadius="md"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <Box
                            as="video"
                            src={video.videoUrl}
                            poster={video.thumbnailUrl || undefined}
                            controls
                            autoPlay={false}
                            loop={video.loop}
                            muted={video.muted}
                            playsInline
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        )}
                      </AspectRatio>
                      {video.duration && (
                        <Box
                          position="absolute"
                          bottom={2}
                          right={2}
                          bg="blackAlpha.700"
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          {formatDuration(video.duration)}
                        </Box>
                      )}
                    </Box>
                    {video.caption && (
                      <Text fontSize="sm" color="gray.600" noOfLines={3}>
                        {video.caption}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      Sort Order: {video.sortOrder}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <VideoForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleFormSubmit}
        video={selectedVideo}
      />
    </Container>
  );
}
