"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  VStack, 
  useToast, 
  HStack, 
  IconButton,
  Image
} from "@chakra-ui/react";

export default function HeroImageUploader({ 
  eventId, 
  onUploaded,
  initialImageId
}: { 
  eventId?: string; 
  onUploaded: (imageId: string | undefined, variants?: any) => void;
  initialImageId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [currentImage, setCurrentImage] = useState<{id: string, variants: any} | null>(null);
  const [lastUploadedImage, setLastUploadedImage] = useState<{id: string, variants: any, fileName: string} | null>(null);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial image if provided, or clear if undefined
  useEffect(() => {
    console.log("HeroImageUploader: useEffect triggered", { initialImageId });
    
    if (initialImageId) {
      console.log("HeroImageUploader: Loading initial image with ID:", initialImageId);
      fetch(`/api/images/metadata/${initialImageId}`)
        .then(res => {
          console.log("HeroImageUploader: Metadata API response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("HeroImageUploader: Metadata API response data:", data);
          if (data.id) {
            console.log("HeroImageUploader: Setting current image:", data);
            setCurrentImage(data);
            onUploaded(data.id, data.variants);
          } else {
            console.error("HeroImageUploader: No image ID in response:", data);
          }
        })
        .catch(error => {
          console.error("HeroImageUploader: Failed to load initial image:", error);
        });
    } else {
      console.log("HeroImageUploader: No initialImageId provided, clearing current image");
      // Clear current image if initialImageId is undefined/null
      setCurrentImage(null);
    }
  }, [initialImageId, onUploaded]);

  const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB limit

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[0]; // Only take the first file for hero image
    
    if (file.size > FILE_SIZE_LIMIT) {
      toast({
        title: `File too large: ${file.name}`,
        description: `Please reduce file size to under ${formatFileSize(FILE_SIZE_LIMIT)}. Current size: ${formatFileSize(file.size)}`,
        status: "warning",
        duration: 5000,
      });
      return;
    }
    
    setBusy(true);
    
    try {
      console.log("HeroImageUploader: Starting upload for file:", file.name);
      const result = await uploadFile(file);
      console.log("HeroImageUploader: Upload result:", result);
      
      const newImage = { 
        id: result.imageId, 
        variants: result.variants, 
        fileName: file.name 
      };
      console.log("HeroImageUploader: Setting new image:", newImage);
      
      setLastUploadedImage(newImage);
      setCurrentImage(newImage);
      onUploaded(result.imageId, result.variants);
      
      console.log("HeroImageUploader: Upload completed successfully");
      
      toast({
        title: "Hero image uploaded successfully",
        description: `${file.name} is now your event's hero image`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error(`HeroImageUploader: Failed to upload ${file.name}:`, error);
      toast({
        title: `Failed to upload ${file.name}`,
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      setBusy(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadFile = async (file: File): Promise<{imageId: string, variants: any}> => {
    const fd = new FormData();
    fd.append("file", file);
    if (eventId) fd.append("eventId", eventId);
    
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    
    if (!res.ok) {
      let errorMessage = "Upload failed";
      
      if (res.status === 413) {
        errorMessage = `File "${file.name}" is too large (${formatFileSize(file.size)}). Please reduce the file size to under ${formatFileSize(FILE_SIZE_LIMIT)}.`;
      } else if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 900;
        const retryMinutes = Math.ceil(retrySeconds / 60);
        errorMessage = `Upload limit exceeded. Please wait ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''} before uploading again.`;
      } else {
        try {
          const json = await res.json();
          errorMessage = json.error || json.details || "Upload failed";
        } catch (e) {
          errorMessage = res.statusText || "Upload failed";
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const json = await res.json();
    return { imageId: json.imageId, variants: json.variants };
  };

  const removeCurrentImage = () => {
    setCurrentImage(null);
    setLastUploadedImage(null);
    onUploaded(undefined); // Clear the image ID - pass undefined to properly remove
  };

  const getImageUrl = (image: any) => {
    console.log("HeroImageUploader: getImageUrl called with image:", image);
    
    // Use direct S3 URLs instead of going through our API
    if (image.variants?.thumb?.webpUrl) {
      console.log("HeroImageUploader: Using thumb webpUrl:", image.variants.thumb.webpUrl);
      return image.variants.thumb.webpUrl;
    }
    if (image.variants?.thumb?.jpgUrl) {
      console.log("HeroImageUploader: Using thumb jpgUrl:", image.variants.thumb.jpgUrl);
      return image.variants.thumb.jpgUrl;
    }
    if (image.variants?.card?.webpUrl) {
      console.log("HeroImageUploader: Using card webpUrl:", image.variants.card.webpUrl);
      return image.variants.card.webpUrl;
    }
    if (image.variants?.card?.jpgUrl) {
      console.log("HeroImageUploader: Using card jpgUrl:", image.variants.card.jpgUrl);
      return image.variants.card.jpgUrl;
    }
    if (image.variants?.hero?.webpUrl) {
      console.log("HeroImageUploader: Using hero webpUrl:", image.variants.hero.webpUrl);
      return image.variants.hero.webpUrl;
    }
    if (image.variants?.hero?.jpgUrl) {
      console.log("HeroImageUploader: Using hero jpgUrl:", image.variants.hero.jpgUrl);
      return image.variants.hero.jpgUrl;
    }
    // Fallback to our API route if no direct URLs
    if (image.variants?.thumb?.webpKey) {
      const apiUrl = `/api/images/${encodeURIComponent(image.variants.thumb.webpKey)}`;
      console.log("HeroImageUploader: Using API route for webpKey:", apiUrl);
      return apiUrl;
    }
    if (image.variants?.thumb?.jpgKey) {
      const apiUrl = `/api/images/${encodeURIComponent(image.variants.thumb.jpgKey)}`;
      console.log("HeroImageUploader: Using API route for jpgKey:", apiUrl);
      return apiUrl;
    }
    console.log("HeroImageUploader: No valid image URLs found, using placeholder");
    return "/placeholder-image.svg";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Current Hero Image Display */}
      {currentImage && (
        <Box p={4} bg="gray.50" borderRadius="md" position="relative">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Current Hero Image:
          </Text>
          <Box w="full" h="48" borderRadius="md" overflow="hidden" mb={2}>
            <Image 
              src={getImageUrl(currentImage)} 
              alt="Current hero image"
              w="full"
              h="full"
              objectFit="cover"
              fallbackSrc="/placeholder-image.svg"
            />
          </Box>
          <IconButton
            aria-label="Remove hero image"
            icon={<span>✕</span>}
            size="sm"
            variant="ghost"
            colorScheme="red"
            position="absolute"
            top={2}
            right={2}
            onClick={removeCurrentImage}
          />
        </Box>
      )}

      {/* Last Uploaded Image Preview */}
      {lastUploadedImage && !currentImage && (
        <Box p={3} bg="green.50" borderRadius="md" position="relative" border="1px solid" borderColor="green.200">
          <HStack spacing={3} align="center">
            <Box w="16" h="16" borderRadius="md" overflow="hidden" flexShrink={0}>
              <Image 
                src={getImageUrl(lastUploadedImage)} 
                alt="Uploaded image preview"
                w="full"
                h="full"
                objectFit="cover"
                fallbackSrc="/placeholder-image.svg"
              />
            </Box>
            <VStack spacing={1} align="start" flex={1}>
              <Text fontSize="sm" fontWeight="medium" color="green.700">
                ✓ Hero Image Uploaded
              </Text>
              <Text fontSize="xs" color="green.600" noOfLines={1}>
                {lastUploadedImage.fileName}
              </Text>
            </VStack>
            <IconButton
              aria-label="Dismiss preview"
              icon={<span>✕</span>}
              size="xs"
              variant="ghost"
              colorScheme="green"
              onClick={() => setLastUploadedImage(null)}
            />
          </HStack>
        </Box>
      )}

      {/* File Selection */}
      <VStack spacing={3} align="stretch">
        <Input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect}
          p={1}
          disabled={busy}
        />
        
        {busy && (
          <Text fontSize="sm" color="blue.600">
            Uploading hero image...
          </Text>
        )}
      </VStack>
      
      {!currentImage && !busy && (
        <VStack spacing={2} align="stretch">
          <Text color="gray.500" fontSize="sm">
            Upload a hero image for your event (JPG, PNG, WebP, HEIC supported)
          </Text>
          <Text color="gray.400" fontSize="xs">
            Maximum file size: {formatFileSize(FILE_SIZE_LIMIT)}
          </Text>
        </VStack>
      )}
    </VStack>
  );
}
