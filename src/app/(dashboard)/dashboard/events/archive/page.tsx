import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventGrid from "@/components/events/EventGrid";
import { Button, HStack, Heading, Box, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default async function ArchivePage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  const archivedEvents = await prisma.event.findMany({ 
    where: { 
      ownerId: me.id,
      status: "ARCHIVED"
    }, 
    include: { heroImage: true }, 
    orderBy: { startAt: "desc" }
  });

  return (
    <VStack align="stretch" spacing={6}>
      <VStack spacing={6} align="center" mb={8}>
        <Box textAlign="center">
          <Heading size="xl" mb={3}>Archived Events</Heading>
          <Text color="gray.600">View and manage your archived events</Text>
        </Box>
        <HStack spacing={4}>
          <Button as={Link} href="/dashboard/events" colorScheme="teal" variant="outline" size="lg">
            Back to Active Events
          </Button>
          <Button as={Link} href="/dashboard/events/new" colorScheme="teal" size="lg">
            Create New Event
          </Button>
        </HStack>
      </VStack>

      {archivedEvents.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            You don't have any archived events
          </Text>
          <Button as={Link} href="/dashboard/events" colorScheme="teal">
            View Active Events
          </Button>
        </Box>
      ) : (
        <EventGrid items={archivedEvents} showArchiveActions={true} isAdminView={true} />
      )}
    </VStack>
  );
}
