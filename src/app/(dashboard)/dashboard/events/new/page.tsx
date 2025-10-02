import EventForm from "@/components/events/EventForm";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default async function NewEventPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/signin");
  
  // Role check can be stricter (ADMIN/ORGANIZER)
  return (
    <VStack align="stretch" spacing={6}>
      <Box textAlign="center">
        <Heading 
          size="xl" 
          mb={3}
          fontFamily="'SUSE Mono', monospace"
          fontWeight="600"
        >
          Create New Event
        </Heading>
        <Text color="gray.600">Fill out the details below to create your event</Text>
      </Box>
      <EventForm />
    </VStack>
  );
}
