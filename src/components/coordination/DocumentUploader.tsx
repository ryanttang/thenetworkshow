"use client";

import { useState, useRef } from "react";
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
  Select,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
} from "@chakra-ui/react";
import { CoordinationDocumentType } from "@prisma/client";

interface DocumentUploaderProps {
  coordinationId: string;
  onSuccess?: () => void;
}

const documentTypes = [
  { value: "MAP", label: "Map", icon: "🗺️" },
  { value: "RUN_OF_SHOW", label: "Run of Show", icon: "📋" },
  { value: "ITINERARY", label: "Itinerary", icon: "📅" },
  { value: "SCHEDULE", label: "Schedule", icon: "⏰" },
  { value: "DIAGRAM", label: "Diagram", icon: "📊" },
  { value: "RIDER", label: "Rider", icon: "📄" },
  { value: "NOTES", label: "Notes", icon: "📝" },
  { value: "OTHER", label: "Other", icon: "📎" },
];

export default function DocumentUploader({ coordinationId, onSuccess }: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [documentData, setDocumentData] = useState<Record<string, {
    title: string;
    description: string;
    type: CoordinationDocumentType;
  }>>({});
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Initialize document data for new files
    selectedFiles.forEach(file => {
      if (!documentData[file.name]) {
        setDocumentData(prev => ({
          ...prev,
          [file.name]: {
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            description: "",
            type: "OTHER" as CoordinationDocumentType,
          }
        }));
      }
    });
  };

  const removeFile = (index: number) => {
    const file = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    setDocumentData(prev => {
      const newData = { ...prev };
      delete newData[file.name];
      return newData;
    });
  };

  const clearAllFiles = () => {
    setFiles([]);
    setDocumentData({});
    setUploadProgress({});
  };

  const updateDocumentData = (fileName: string, field: string, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value,
      }
    }));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    
    const res = await fetch("/api/upload/document", { method: "POST", body: fd });
    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(json.error ?? "Upload failed");
    }
    
    return json.fileUrl; // Return the actual file URL for the document
  };

  const createDocument = async (file: File, fileUrl: string) => {
    const data = documentData[file.name];
    
    const response = await fetch(`/api/coordination/${coordinationId}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        type: data.type,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create document");
    }

    return response.json();
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
          // Upload file
          const fileUrl = await uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
          
          // Create document record
          await createDocument(file, fileUrl);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          results.push(file.name);
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
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${results.length} document${results.length !== 1 ? 's' : ''}`,
          status: "success",
          duration: 3000,
        });
        clearAllFiles();
        // Call onSuccess callback to trigger parent state update
        if (onSuccess) {
          onSuccess();
        }
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

  const getDocumentTypeIcon = (type: string) => {
    const typeInfo = documentTypes.find(t => t.value === type);
    return typeInfo?.icon || "📎";
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* File Selection */}
      <VStack spacing={3} align="stretch">
        <Input 
          ref={fileInputRef}
          type="file" 
          accept="*/*" 
          multiple
          onChange={handleFileSelect}
          p={1}
        />
        
        <HStack spacing={3}>
          <Button 
            onClick={onUpload} 
            isLoading={busy} 
            colorScheme="blue"
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
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            Selected Files ({files.length}) - Total: {formatFileSize(getTotalSize())}
          </Text>
          <VStack spacing={4} align="stretch" maxH="96" overflowY="auto">
            {files.map((file, index) => (
              <Box key={`${file.name}-${index}`} p={4} bg="white" borderRadius="md" shadow="sm">
                <VStack spacing={3} align="stretch">
                  {/* File Header */}
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1} flex={1}>
                        {file.name}
                      </Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {formatFileSize(file.size)}
                      </Badge>
                    </HStack>
                    <IconButton
                      aria-label="Remove file"
                      icon={<span>✕</span>}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeFile(index)}
                    />
                  </HStack>

                  {/* Document Metadata */}
                  <VStack spacing={3} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="xs">Title</FormLabel>
                      <Input
                        size="sm"
                        value={documentData[file.name]?.title || ""}
                        onChange={(e) => updateDocumentData(file.name, "title", e.target.value)}
                        placeholder="Document title"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs">Type</FormLabel>
                      <Select
                        size="sm"
                        value={documentData[file.name]?.type || "OTHER"}
                        onChange={(e) => updateDocumentData(file.name, "type", e.target.value)}
                      >
                        {documentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs">Description (Optional)</FormLabel>
                      <Textarea
                        size="sm"
                        value={documentData[file.name]?.description || ""}
                        onChange={(e) => updateDocumentData(file.name, "description", e.target.value)}
                        placeholder="Brief description of this document"
                        rows={2}
                      />
                    </FormControl>
                  </VStack>

                  {/* Upload Progress */}
                  {uploadProgress[file.name] !== undefined && (
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Upload Progress: {uploadProgress[file.name]}%
                      </Text>
                      <Box w="full" bg="gray.200" borderRadius="full" h={2}>
                        <Box
                          w={`${uploadProgress[file.name]}%`}
                          bg="blue.500"
                          h="full"
                          borderRadius="full"
                          transition="width 0.3s ease"
                        />
                      </Box>
                    </Box>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
      
      {files.length === 0 && (
        <Text color="gray.500" fontSize="sm" textAlign="center" py={8}>
          Select files to upload (PDF, DOC, images, etc.)
        </Text>
      )}
    </VStack>
  );
}
