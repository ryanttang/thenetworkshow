import { SupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { z } from "zod";
import { createEventSchema } from "@/lib/validation";
import { canEditEvent } from "@/lib/rbac";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const supabase = new SupabaseClient(true);
  const me = await supabase.findUnique("User", { email: session.user.email }) as any;
  if (!me) redirect("/signin");
  
  const event = await supabase.findUnique("Event", { 
    id: params.id
  }) as any;
  
  if (!event) redirect("/dashboard/events");
  
  // Check if user can edit this event (admins/organizers can edit any event)
  if (!canEditEvent(event, me.id, me.role)) {
    redirect("/dashboard/events");
  }

  // Get hero image and detail images
  const heroImage = event.heroImageId ? await supabase.findUnique("Image", { id: event.heroImageId }) as any : null;
  const detailImages = event.images ? await supabase.findMany("Image", {
    where: { id: { in: event.images } },
    select: "*"
  }) as any[] : [];

  // Format dates for datetime-local inputs
  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  const initialData: Partial<z.infer<typeof createEventSchema>> = {
    title: event.title,
    description: event.description || "",
    ticketUrl: event.ticketUrl || "",
    buttonType: event.buttonType as "RSVP" | "BUY_TICKETS",
    locationName: event.locationName || "",
    address: event.address || "",
    city: event.city || "",
    state: event.state || "",
    latitude: event.latitude || undefined,
    longitude: event.longitude || undefined,
    startAt: formatDateForInput(event.startAt),
    endAt: event.endAt ? formatDateForInput(event.endAt) : "",
    timezone: event.timezone,
    status: event.status,
    heroImageId: event.heroImageId || undefined
  };

  return (
    <Box maxW="4xl" mx="auto">
      <Box textAlign="center" mb={6}>
        <Heading size="lg" mb={2}>Edit Event</Heading>
        <Text color="gray.600" fontSize="sm">Update your event details</Text>
      </Box>
      
      <EventForm 
        initial={initialData} 
        mode="edit" 
        eventId={event.id} 
        existingImages={detailImages?.map((img: { id: string; variants: any }) => ({
          id: img.id,
          variants: img.variants,
          fileName: `image-${img.id.slice(-8)}` // Generate a filename since we don't store original names
        })) || []}
      />
    </Box>
  );
}
