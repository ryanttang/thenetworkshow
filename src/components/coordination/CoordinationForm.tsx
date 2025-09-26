"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";

interface Event {
  id: string;
  title: string;
  slug: string;
  startAt: Date;
}

interface CoordinationFormProps {
  events: Event[];
  coordination?: any;
  onSuccess?: () => void;
}

export default function CoordinationForm({ 
  events, 
  coordination, 
  onSuccess 
}: CoordinationFormProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: coordination?.eventId || "",
    title: coordination?.title || "",
    description: coordination?.description || "",
    notes: coordination?.notes || "",
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = coordination 
        ? `/api/coordination/${coordination.id}`
        : "/api/coordination";
      
      const method = coordination ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save coordination");
      }

      toast({
        title: coordination ? "Coordination updated" : "Coordination created",
        description: coordination 
          ? "Your coordination set has been updated successfully"
          : "Your coordination set has been created successfully",
        status: "success",
        duration: 3000,
      });

      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form if creating new
      if (!coordination) {
        setFormData({
          eventId: "",
          title: "",
          description: "",
          notes: "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Button 
        onClick={onOpen}
        colorScheme="blue"
        size="lg"
        _hover={{
          transform: "translateY(-1px)",
          shadow: "lg"
        }}
        transition="all 0.2s"
      >
        {coordination ? "Edit Coordination" : "Create Coordination Set"}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {coordination ? "Edit Coordination Set" : "Create Coordination Set"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Event</FormLabel>
                  <Select
                    value={formData.eventId}
                    onChange={(e) => handleInputChange("eventId", e.target.value)}
                    placeholder="Select an event"
                  >
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.startAt).toLocaleDateString()}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., VIP Event Coordination"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of this coordination set"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes for team members"
                    rows={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText={coordination ? "Updating..." : "Creating..."}
                  w="full"
                  size="lg"
                >
                  {coordination ? "Update Coordination" : "Create Coordination"}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
