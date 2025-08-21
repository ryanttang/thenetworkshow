"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@/lib/validation";
import { Box, Button, FormControl, FormLabel, Input, Textarea, HStack, Switch, VStack, useToast } from "@chakra-ui/react";
import ImageUploader from "./ImageUploader";
import { useState } from "react";

type FormVals = any;

export default function EventForm({ initial, mode = "create", eventId }: { 
  initial?: Partial<FormVals>; 
  mode?: "create" | "edit";
  eventId?: string;
}) {
  const [heroImageId, setHeroImageId] = useState<string | undefined>(initial?.heroImageId);
  const toast = useToast();
  
  const { register, handleSubmit, formState: { isSubmitting, errors }, watch, setValue } = useForm<FormVals>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      ticketUrl: "",
      buttonType: "RSVP",
      locationName: "",
      city: "",
      state: "",
      startAt: "",
      endAt: "",
      status: "DRAFT",
      ...initial
    }
  });

  const onSubmit = async (vals: FormVals) => {
    console.log("Form submitted with values:", vals);
    console.log("Hero image ID:", heroImageId);
    
    // Basic validation
    if (!vals.title || vals.title.length < 3) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 3 characters long",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    if (!vals.startAt) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    try {
      const url = mode === "edit" ? `/api/events/${eventId}` : "/api/events";
      const method = mode === "edit" ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vals, heroImageId })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error ? JSON.stringify(json.error) : `Failed to ${mode} event`);
      }
      
      toast({
        title: `Event ${mode === "edit" ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
      });
      
      // Redirect to dashboard
      window.location.href = "/dashboard/events";
    } catch (error) {
      toast({
        title: `Error ${mode === "edit" ? "updating" : "creating"} event`,
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} bg="white" p={6} borderRadius="xl" boxShadow="sm">
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title *</FormLabel>
          <Input {...register("title")} />
        </FormControl>
        
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea rows={4} {...register("description")} />
        </FormControl>
        
        <FormControl>
          <FormLabel>Ticket URL</FormLabel>
          <Input type="url" {...register("ticketUrl")} placeholder="https://..." />
        </FormControl>
        
        <FormControl>
          <FormLabel>Button Type</FormLabel>
          <HStack spacing={4}>
            <Button
              type="button"
              variant={watch("buttonType") === "RSVP" ? "solid" : "outline"}
              colorScheme="teal"
              onClick={() => setValue("buttonType", "RSVP")}
            >
              RSVP
            </Button>
            <Button
              type="button"
              variant={watch("buttonType") === "BUY_TICKETS" ? "solid" : "outline"}
              colorScheme="teal"
              onClick={() => setValue("buttonType", "BUY_TICKETS")}
            >
              Buy Tickets
            </Button>
          </HStack>
        </FormControl>
        
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.startAt}>
            <FormLabel>Start Date & Time *</FormLabel>
            <Input type="datetime-local" {...register("startAt")} />
          </FormControl>
          <FormControl>
            <FormLabel>End Date & Time</FormLabel>
            <Input type="datetime-local" {...register("endAt")} />
          </FormControl>
        </HStack>
        
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Location Name</FormLabel>
            <Input {...register("locationName")} />
          </FormControl>
          <FormControl>
            <FormLabel>City</FormLabel>
            <Input {...register("city")} />
          </FormControl>
          <FormControl>
            <FormLabel>State</FormLabel>
            <Input {...register("state")} />
          </FormControl>
        </HStack>
        
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Publish immediately</FormLabel>
          <Switch 
            defaultChecked={initial?.status === "PUBLISHED"}
            onChange={(e) => setValue("status", e.target.checked ? "PUBLISHED" : "DRAFT")}
          />
        </FormControl>

        <Box>
          <FormLabel>Hero Image</FormLabel>
          <ImageUploader 
            onUploaded={(id) => setHeroImageId(id)} 
            initialImageId={initial?.heroImageId}
          />
        </Box>
        
        <Button type="submit" colorScheme="teal" isLoading={isSubmitting} size="lg">
          {mode === "edit" ? "Update Event" : "Save Event"}
        </Button>
        
        {/* Debug button */}
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log("Form errors:", errors);
            console.log("Form values:", watch());
            console.log("Is submitting:", isSubmitting);
          }}
        >
          Debug Form
        </Button>
      </VStack>
    </Box>
  );
}
