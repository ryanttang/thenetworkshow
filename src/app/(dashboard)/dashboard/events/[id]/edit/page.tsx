import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  const event = await prisma.event.findUnique({ 
    where: { id: params.id, ownerId: me.id }, 
    include: { heroImage: true }
  });
  
  if (!event) redirect("/dashboard/events");

  // Format dates for datetime-local inputs
  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  const initialData = {
    ...event,
    startAt: formatDateForInput(event.startAt),
    endAt: event.endAt ? formatDateForInput(event.endAt) : "",
    heroImageId: event.heroImageId || undefined
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box textAlign="center" mb={8}>
        <Heading size="xl" mb={3}>Edit Event</Heading>
        <Text color="gray.600">Update your event details</Text>
      </Box>
      
      <EventForm initial={initialData} mode="edit" eventId={event.id} />
    </VStack>
  );
}
