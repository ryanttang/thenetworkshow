import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventGrid from "@/components/events/EventGrid";
import { Button, HStack, Heading, Box, Text, VStack, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import Link from "next/link";

export default async function DashboardEventsPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me) redirect("/signin");
  
  // Admins and Organizers can see all events, others only see their own
  const canManageAllEvents = me.role === "ADMIN" || me.role === "ORGANIZER";
  
  const allActiveEvents = await prisma.event.findMany({ 
    where: { 
      ...(canManageAllEvents ? {} : { ownerId: me.id }),
      status: { not: "ARCHIVED" }
    }, 
    include: { heroImage: true, owner: { select: { name: true, email: true } } }, 
    orderBy: { startAt: "desc" }
  });

  const draftEvents = allActiveEvents.filter((e: any) => e.status === "DRAFT");
  const publishedEvents = allActiveEvents.filter((e: any) => e.status === "PUBLISHED");

  const archivedCount = await prisma.event.count({
    where: {
      ...(canManageAllEvents ? {} : { ownerId: me.id }),
      status: "ARCHIVED"
    }
  });

  return (
    <VStack align="stretch" spacing={6}>
      <VStack spacing={6} align="center" mb={8}>
        <Box textAlign="center">
          <Heading 
            size="xl" 
            mb={3}
            fontFamily="'SUSE Mono', monospace"
            fontWeight="600"
          >
            {canManageAllEvents ? "All Events" : "My Events"}
          </Heading>
          <Text color="gray.600">
            {canManageAllEvents 
              ? "Manage all events across the platform" 
              : "Manage your events and create new ones"
            }
          </Text>
        </Box>
        <HStack spacing={4}>
          <Button as={Link} href="/dashboard/events/new" colorScheme="teal" size="lg">
            Create New Event
          </Button>
          {archivedCount > 0 && (
            <Button as={Link} href="/dashboard/events/archive" colorScheme="gray" variant="outline" size="lg">
              View Archive ({archivedCount})
            </Button>
          )}
        </HStack>
      </VStack>

      {allActiveEvents.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            {canManageAllEvents 
              ? "No events have been created yet" 
              : "You haven't created any events yet"
            }
          </Text>
          <Button as={Link} href="/dashboard/events/new" colorScheme="teal">
            Create Your First Event
          </Button>
        </Box>
      ) : (
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>All ({allActiveEvents.length})</Tab>
            <Tab>Draft ({draftEvents.length})</Tab>
            <Tab>Published ({publishedEvents.length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <EventGrid items={allActiveEvents} showArchiveActions={false} isAdminView={true} />
            </TabPanel>
            <TabPanel px={0}>
              <EventGrid items={draftEvents} showArchiveActions={false} isAdminView={true} />
            </TabPanel>
            <TabPanel px={0}>
              <EventGrid items={publishedEvents} showArchiveActions={false} isAdminView={true} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </VStack>
  );
}
