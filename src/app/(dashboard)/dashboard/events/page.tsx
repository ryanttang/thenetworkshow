import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventGrid from "@/components/events/EventGrid";
import { Button, HStack, Heading, Box, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default async function DashboardEventsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  const items = await prisma.event.findMany({ 
    where: { ownerId: me.id }, 
    include: { heroImage: true }, 
    orderBy: { startAt: "desc" }
  });

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="center">
        <Box>
          <Heading size="xl">My Events</Heading>
          <Text color="gray.600">Manage your events and create new ones</Text>
        </Box>
        <Button as={Link} href="/dashboard/events/new" colorScheme="teal" size="lg">
          Create New Event
        </Button>
      </HStack>

      {items.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            You haven't created any events yet
          </Text>
          <Button as={Link} href="/dashboard/events/new" colorScheme="teal">
            Create Your First Event
          </Button>
        </Box>
      ) : (
        <EventGrid items={items} />
      )}
    </VStack>
  );
}
