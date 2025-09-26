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
  SimpleGrid,
  Badge,
  Flex,
  Spacer,
  Image
} from "@chakra-ui/react";

export default function ImageUploader({ 
  eventId, 
  onUploaded,
  showUploadedImages = false,
  initialImageId
}: { 
  eventId?: string; 
  onUploaded: (imageId: string, variants?: any) => void;
  showUploadedImages?: boolean;
  initialImageId?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, variants: any, fileName: string}>>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [currentImage, setCurrentImage] = useState<{id: string, variants: any} | null>(null);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Load initial image if provided
  useEffect(() => {
    if (initialImageId) {
      fetch(`/api/images/metadata/${initialImageId}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setCurrentImage(data);
            onUploaded(data.id, data.variants);
          }
        })
        .catch(error => {
          console.error("Failed to load initial image:", error);
        });
    }
  }, [initialImageId, onUploaded]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    // Filter for image files only
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setUploadProgress({});
  };

  const uploadFile = async (file: File): Promise<{imageId: string, variants: any}> => {
    const fd = new FormData();
    fd.append("file", file);
    if (eventId) fd.append("eventId", eventId);
    
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    
    if (!res.ok) {
      let errorMessage = "Upload failed";
      try {
        const json = await res.json();
        errorMessage = json.error || json.details || "Upload failed";
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = res.statusText || "Upload failed";
      }
      throw new Error(errorMessage);
    }
    
    const json = await res.json();
    return { imageId: json.imageId, variants: json.variants };
  };

  const onUpload = async () => {
    if (files.length === 0) return;
    setBusy(true);
    
    try {
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const result = await uploadFile(file);
          const newImage = { 
            id: result.imageId, 
            variants: result.variants, 
            fileName: file.name 
          };
          setUploadedImages(prev => [...prev, newImage]);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          results.push(result);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({
            title: `Failed to upload ${file.name}`,
            description: error instanceof Error ? error.message : "Unknown error",
            status: "error",
            duration: 5000,
          });
        }
      }
      
      if (results.length > 0) {
        // Only call onUploaded once with the last uploaded image
        const lastResult = results[results.length - 1];
        onUploaded(lastResult.imageId, lastResult.variants);
        
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${results.length} image${results.length !== 1 ? 's' : ''}`,
          status: "success",
          duration: 3000,
        });
        clearAllFiles();
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      setBusy(false);
    }
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeCurrentImage = () => {
    setCurrentImage(null);
    onUploaded(""); // Clear the image ID
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
      return `/api/images/${encodeURIComponent(image.variants.thumb.webpKey)}`;
    }
    if (image.variants?.thumb?.jpgKey) {
      return `/api/images/${encodeURIComponent(image.variants.thumb.jpgKey)}`;
    }
    return "/placeholder-image.svg";
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
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
      {/* Current Image Display */}
      {currentImage && (
        <Box p={4} bg="gray.50" borderRadius="md" position="relative">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Current Hero Image:
          </Text>
          <Box w="full" h="32" borderRadius="md" overflow="hidden" mb={2}>
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
            aria-label="Remove current image"
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

      {/* File Selection */}
      <VStack spacing={3} align="stretch">
        <HStack spacing={3}>
          <Input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileSelect}
            p={1}
            flex={1}
          />
          <Input 
            ref={folderInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFolderSelect}
            p={1}
            flex={1}
            placeholder="Select folder"
            // @ts-ignore - webkitdirectory is a valid HTML attribute for folder selection
            webkitdirectory=""
          />
        </HStack>
        
        <HStack spacing={3}>
          <Button 
            onClick={onUpload} 
            isLoading={busy} 
            colorScheme="teal"
            disabled={files.length === 0}
            size="sm"
          >
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </Button>
          {files.length > 0 && (
            <Button 
              onClick={clearAllFiles} 
              variant="outline" 
              size="sm"
            >
              Clear All
            </Button>
          )}
        </HStack>
      </VStack>
      
      {/* File Info */}
      {files.length > 0 && (
        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Selected Files ({files.length}) - Total: {formatFileSize(getTotalSize())}
          </Text>
          <VStack spacing={2} align="stretch" maxH="32" overflowY="auto">
            {files.map((file, index) => (
              <HStack key={`${file.name}-${index}`} p={2} bg="white" borderRadius="md" shadow="sm">
                <Text fontSize="sm" flex={1} noOfLines={1}>
                  {file.name}
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  {formatFileSize(file.size)}
                </Badge>
                <IconButton
                  aria-label="Remove file"
                  icon={<span>✕</span>}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeFile(index)}
                />
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
      
      {files.length === 0 && !currentImage && (
        <Text color="gray.500" fontSize="sm">
          Select images or a folder to upload (JPG, PNG, WebP, HEIC supported)
        </Text>
      )}

      {/* Uploaded Images */}
      {showUploadedImages && uploadedImages.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Recently uploaded:
          </Text>
          <SimpleGrid columns={3} spacing={3}>
            {uploadedImages.map((img) => (
              <Box key={img.id} p={2} bg="gray.50" borderRadius="md" position="relative">
                <Box w="full" h="24" borderRadius="md" overflow="hidden" mb={2}>
                  <img 
                    src={getImageUrl(img)} 
                    alt={img.fileName || "Uploaded image"}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-image.svg";
                    }}
                  />
                </Box>
                <Text fontSize="xs" color="gray.600" noOfLines={1} mb={1}>
                  {img.fileName || "Image"}
                </Text>
                <IconButton
                  aria-label="Remove image"
                  icon={<span>✕</span>}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => removeImage(img.id)}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}
