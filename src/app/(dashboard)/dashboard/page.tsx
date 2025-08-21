import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventGrid from "@/components/events/EventGrid";
import { Button, HStack, Heading, Box, Text, VStack, SimpleGrid, Card, CardBody, CardHeader } from "@chakra-ui/react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  const items = await prisma.event.findMany({ 
    where: { ownerId: me.id }, 
    include: { heroImage: true }, 
    orderBy: { startAt: "desc" }
  });

  const galleries = await prisma.gallery.findMany({
    where: { event: { ownerId: me.id } },
    include: { _count: { select: { images: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <VStack align="stretch" spacing={8}>
      {/* Welcome Section */}
      <Box>
        <Heading size="xl" mb={2}>Welcome back, {me.name || 'Event Organizer'}!</Heading>
        <Text color="gray.600">Manage your events and galleries from your dashboard</Text>
      </Box>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Events Card */}
        <Card>
          <CardHeader>
            <HStack>
              <Text fontSize="2xl" color="blue.500">📅</Text>
              <Heading size="md">Events</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                You have {items.length} event{items.length !== 1 ? 's' : ''} in your portfolio
              </Text>
              <HStack justify="space-between">
                <Button as={Link} href="/dashboard/events" variant="outline" size="sm">
                  View All Events
                </Button>
                <Button as={Link} href="/dashboard/events/new" colorScheme="blue" size="sm">
                  Create Event
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Gallery Card */}
        <Card>
          <CardHeader>
            <HStack>
              <Text fontSize="2xl" color="green.500">🖼️</Text>
              <Heading size="md">Gallery</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                You have {galleries.length} gallery{galleries.length !== 1 ? 'ies' : ''} with photos
              </Text>
              <HStack justify="space-between">
                <Button as={Link} href="/dashboard/gallery" variant="outline" size="sm">
                  Manage Galleries
                </Button>
                <Button as={Link} href="/dashboard/gallery" colorScheme="green" size="sm">
                  Create Gallery
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Events */}
      <Box>
        <HStack justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg">Recent Events</Heading>
            <Text color="gray.600">Your latest event creations</Text>
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
          <EventGrid items={items.slice(0, 6)} />
        )}
      </Box>
    </VStack>
  );
}
