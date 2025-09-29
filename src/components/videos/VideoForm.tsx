"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  HStack,
  Text,
  Box,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { uploadFile } from "@/lib/s3";
import type { RecentEventVideo } from "@/types";

interface VideoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  video?: RecentEventVideo | null;
}

export default function VideoForm({ isOpen, onClose, onSubmit, video }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    videoUrl: "",
    videoType: "UPLOADED" as "UPLOADED" | "EXTERNAL",
    thumbnailUrl: "",
    duration: "",
    sortOrder: 0,
    isPublished: true,
    autoplay: true,
    loop: true,
    muted: true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        caption: video.caption || "",
        videoUrl: video.videoUrl,
        videoType: video.videoType,
        thumbnailUrl: video.thumbnailUrl || "",
        duration: video.duration?.toString() || "",
        sortOrder: video.sortOrder,
        isPublished: video.isPublished,
        autoplay: video.autoplay,
        loop: video.loop,
        muted: video.muted,
      });
    } else {
      setFormData({
        title: "",
        caption: "",
        videoUrl: "",
        videoType: "UPLOADED",
        thumbnailUrl: "",
        duration: "",
        sortOrder: 0,
        isPublished: true,
        autoplay: true,
        loop: true,
        muted: true,
      });
    }
  }, [video, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, type: "video" | "thumbnail") => {
    const setUploadingState = type === "video" ? setUploading : setUploadingThumbnail;
    
    try {
      setUploadingState(true);
      const url = await uploadFile(file, `videos/${type}s/`);
      
      if (type === "video") {
        handleInputChange("videoUrl", url);
        handleInputChange("videoType", "UPLOADED");
      } else {
        handleInputChange("thumbnailUrl", url);
      }
      
      toast({
        title: "Success",
        description: `${type} uploaded successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingState(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      duration: formData.duration && formData.duration.trim() !== "" 
        ? parseInt(formData.duration) 
        : undefined,
      thumbnailUrl: formData.thumbnailUrl && formData.thumbnailUrl.trim() !== "" 
        ? formData.thumbnailUrl 
        : undefined,
      caption: formData.caption && formData.caption.trim() !== "" 
        ? formData.caption 
        : undefined,
    };
    
    console.log("Form submit data:", submitData);
    onSubmit(submitData);
  };

  const isExternalVideo = formData.videoType === "EXTERNAL";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {video ? "Edit Video" : "Add New Video"}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter video title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Caption</FormLabel>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => handleInputChange("caption", e.target.value)}
                  placeholder="Enter video caption (optional)"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Video Type</FormLabel>
                <Select
                  value={formData.videoType}
                  onChange={(e) => handleInputChange("videoType", e.target.value)}
                >
                  <option value="UPLOADED">Upload Video File</option>
                  <option value="EXTERNAL">External Video Link</option>
                </Select>
              </FormControl>

              {isExternalVideo ? (
                <FormControl isRequired>
                  <FormLabel>Video URL</FormLabel>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                    type="url"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Enter a direct link to the video file (MP4, WebM, etc.) or YouTube URL
                  </Text>
                </FormControl>
              ) : (
                <FormControl isRequired>
                  <FormLabel>Video File</FormLabel>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, "video");
                      }
                    }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <HStack mt={2}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.500">
                        Uploading video...
                      </Text>
                    </HStack>
                  )}
                  {formData.videoUrl && (
                    <Text fontSize="sm" color="green.500" mt={1}>
                      ✓ Video uploaded: {formData.videoUrl.split('/').pop()}
                    </Text>
                  )}
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Thumbnail Image (Optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, "thumbnail");
                    }
                  }}
                  disabled={uploadingThumbnail}
                />
                {uploadingThumbnail && (
                  <HStack mt={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">
                      Uploading thumbnail...
                    </Text>
                  </HStack>
                )}
                {formData.thumbnailUrl && (
                  <Text fontSize="sm" color="green.500" mt={1}>
                    ✓ Thumbnail uploaded: {formData.thumbnailUrl.split('/').pop()}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Duration (seconds)</FormLabel>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="120"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Optional: Duration in seconds for display purposes
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Sort Order</FormLabel>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange("sortOrder", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Lower numbers appear first in the slider
                </Text>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.isPublished}
                    onChange={(e) => handleInputChange("isPublished", e.target.checked)}
                  />
                  <Text>Published (visible on homepage)</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.autoplay}
                    onChange={(e) => handleInputChange("autoplay", e.target.checked)}
                  />
                  <Text>Autoplay (start playing automatically)</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.loop}
                    onChange={(e) => handleInputChange("loop", e.target.checked)}
                  />
                  <Text>Loop (repeat video continuously)</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={formData.muted}
                    onChange={(e) => handleInputChange("muted", e.target.checked)}
                  />
                  <Text>Muted (start without sound)</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              color="white"
              shadow="md"
              fontWeight="600"
              _hover={{
                bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                transform: "translateY(-1px)",
                shadow: "lg"
              }}
              transition="all 0.3s ease-in-out"
            >
              {video ? "Update Video" : "Create Video"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
