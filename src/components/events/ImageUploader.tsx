"use client";
import { useState } from "react";
import { Box, Button, Input, Text, VStack, useToast, HStack, IconButton } from "@chakra-ui/react";

export default function ImageUploader({ 
  eventId, 
  onUploaded,
  showUploadedImages = false
}: { 
  eventId?: string; 
  onUploaded: (imageId: string, variants: any) => void;
  showUploadedImages?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, variants: any}>>([]);
  const toast = useToast();

  const onUpload = async () => {
    if (!file) return;
    setBusy(true);
    
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (eventId) fd.append("eventId", eventId);
      
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      
      if (res.ok) {
        const newImage = { id: json.imageId, variants: json.variants };
        setUploadedImages(prev => [...prev, newImage]);
        onUploaded(json.imageId, json.variants);
        toast({
          title: "Upload successful",
          status: "success",
          duration: 3000,
        });
        setFile(null);
      } else {
        throw new Error(json.error ?? "Upload failed");
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

  const getImageUrl = (image: any) => {
    if (image.variants?.thumb?.key) {
      return `/api/images/${image.variants.thumb.key}`;
    }
    if (image.variants?.card?.key) {
      return `/api/images/${image.variants.card.key}`;
    }
    return "/placeholder-image.svg";
  };

  return (
    <VStack spacing={3} align="stretch">
      <HStack>
        <Input 
          type="file" 
          accept="image/*" 
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          p={1}
          flex={1}
        />
        <Button 
          onClick={onUpload} 
          isLoading={busy} 
          colorScheme="teal"
          disabled={!file}
          size="sm"
        >
          Upload
        </Button>
      </HStack>
      
      {!file && (
        <Text color="gray.500" fontSize="sm">
          Upload an image (JPG, PNG, WebP, HEIC supported)
        </Text>
      )}

      {showUploadedImages && uploadedImages.length > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Recently uploaded:
          </Text>
          <VStack spacing={2} align="stretch">
            {uploadedImages.map((img) => (
              <HStack key={img.id} p={2} bg="gray.50" borderRadius="md">
                <Box w="12" h="12" borderRadius="md" overflow="hidden">
                  <img 
                    src={getImageUrl(img)} 
                    alt="Uploaded image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Text fontSize="sm" flex={1}>
                  Image uploaded successfully
                </Text>
                <IconButton
                  aria-label="Remove image"
                  icon={<span>✕</span>}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeImage(img.id)}
                />
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
