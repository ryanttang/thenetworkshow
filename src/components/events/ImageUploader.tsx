"use client";
import { useState } from "react";
import { Box, Button, Input, Text, VStack, useToast } from "@chakra-ui/react";

export default function ImageUploader({ 
  eventId, 
  onUploaded 
}: { 
  eventId?: string; 
  onUploaded: (imageId: string, variants: any) => void 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
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

  return (
    <VStack spacing={3} align="stretch">
      <Input 
        type="file" 
        accept="image/*" 
        onChange={e => setFile(e.target.files?.[0] ?? null)}
        p={1}
      />
      <Button 
        onClick={onUpload} 
        isLoading={busy} 
        colorScheme="teal"
        disabled={!file}
      >
        Upload Image
      </Button>
      {!file && (
        <Text color="gray.500" fontSize="sm">
          Upload a flyer (JPG, PNG, WebP, HEIC supported)
        </Text>
      )}
    </VStack>
  );
}
