import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventGrid from "@/components/events/EventGrid";
import { Button, HStack, Heading, Box, Text, VStack, SimpleGrid, Card, CardBody, CardHeader, Container, Badge } from "@chakra-ui/react";
import Link from "next/link";

export default async function DashboardPage() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) redirect("/signin");
    
    const me = await prisma.user.findUnique({ where: { email: session.user.email }});
    if (!me) redirect("/signin");
    
    const items = await prisma.event.findMany({ 
      where: { 
        ownerId: me.id,
        status: "PUBLISHED"
      }, 
      include: { heroImage: true }, 
      orderBy: { startAt: "desc" }
    });

    const galleries = await prisma.gallery.findMany({
      where: {
        OR: [
          { event: { ownerId: me.id } }, // Galleries from user's events
          { eventId: null } // Standalone galleries (accessible to all users)
        ]
      },
      include: { _count: { select: { images: true } } },
      orderBy: { createdAt: "desc" }
    });

    const coordinations = await prisma.coordination.findMany({
      where: { 
        event: { ownerId: me.id }
      },
      include: { 
        _count: { select: { documents: true } }
      },
      orderBy: { createdAt: "desc" }
    });

  return (
    <Container maxW="full" px={0}>
      <VStack align="stretch" spacing={16} py={8}>
        {/* Welcome Section */}
        <Box textAlign="center" px={{ base: 4, md: 0 }}>
          <Heading 
            size="2xl" 
            mb={6} 
            color="gray.800"
            fontWeight="700"
            lineHeight="1.2"
          >
            Welcome back, {me.name || 'Event Organizer'}!
          </Heading>
          <Text 
            color="gray.600" 
            fontSize="xl" 
            fontWeight="500"
            maxW="2xl"
            lineHeight="1.6"
            mx="auto"
          >
            Manage your events and galleries from your dashboard
          </Text>
        </Box>

        {/* Quick Actions */}
        <Box px={{ base: 4, md: 0 }}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {/* Events Card */}
            <Card 
              shadow="lg" 
              borderRadius="2xl" 
              overflow="hidden"
              border="1px solid"
              borderColor="gray.100"
              _hover={{
                shadow: "xl",
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <CardHeader pb={6} px={8} pt={8}>
                <VStack align="flex-start" spacing={4}>
                  <HStack spacing={4}>
                    <Box 
                      p={3} 
                      bg="blue.50" 
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl">📅</Text>
                    </Box>
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="lg" color="gray.800">Events</Heading>
                      <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        {items.length} {items.length === 1 ? 'Event' : 'Events'}
                      </Badge>
                    </VStack>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0} px={8} pb={8}>
                <VStack align="stretch" spacing={8}>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">
                    You have {items.length} event{items.length !== 1 ? 's' : ''} in your portfolio
                  </Text>
                  <VStack spacing={4} w="full">
                    <Button 
                      as={Link} 
                      href="/dashboard/events" 
                      variant="outline" 
                      size="lg" 
                      w="full"
                      colorScheme="blue"
                      _hover={{
                        bg: "blue.50",
                        borderColor: "blue.300"
                      }}
                    >
                      View All Events
                    </Button>
                    <Button 
                      as={Link} 
                      href="/dashboard/events/new" 
                      colorScheme="blue" 
                      size="lg" 
                      w="full"
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Create Event
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Gallery Card */}
            <Card 
              shadow="lg" 
              borderRadius="2xl" 
              overflow="hidden"
              border="1px solid"
              borderColor="gray.100"
              _hover={{
                shadow: "xl",
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <CardHeader pb={6} px={8} pt={8}>
                <VStack align="flex-start" spacing={4}>
                  <HStack spacing={4}>
                    <Box 
                      p={3} 
                      bg="green.50" 
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl">🖼️</Text>
                    </Box>
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="lg" color="gray.800">Gallery</Heading>
                      <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                        {galleries.length} {galleries.length === 1 ? 'Gallery' : 'Galleries'}
                      </Badge>
                    </VStack>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0} px={8} pb={8}>
                <VStack align="stretch" spacing={8}>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">
                    You have {galleries.length} gallery{galleries.length !== 1 ? 'ies' : ''} with photos
                  </Text>
                  <VStack spacing={4} w="full">
                    <Button 
                      as={Link} 
                      href="/dashboard/gallery" 
                      variant="outline" 
                      size="lg" 
                      w="full"
                      colorScheme="green"
                      _hover={{
                        bg: "green.50",
                        borderColor: "green.300"
                      }}
                    >
                      Manage Galleries
                    </Button>
                    <Button 
                      as={Link} 
                      href="/dashboard/gallery" 
                      colorScheme="green" 
                      size="lg" 
                      w="full"
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Create Gallery
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Coordination Card */}
            <Card 
              shadow="lg" 
              borderRadius="2xl" 
              overflow="hidden"
              border="1px solid"
              borderColor="gray.100"
              _hover={{
                shadow: "xl",
                transform: "translateY(-2px)",
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <CardHeader pb={6} px={8} pt={8}>
                <VStack align="flex-start" spacing={4}>
                  <HStack spacing={4}>
                    <Box 
                      p={3} 
                      bg="purple.50" 
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl">📋</Text>
                    </Box>
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="lg" color="gray.800">Coordination</Heading>
                      <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
                        {coordinations.length} {coordinations.length === 1 ? 'Set' : 'Sets'}
                      </Badge>
                    </VStack>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0} px={8} pb={8}>
                <VStack align="stretch" spacing={8}>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">
                    You have {coordinations.length} coordination set{coordinations.length !== 1 ? 's' : ''} for event planning
                  </Text>
                  <VStack spacing={4} w="full">
                    <Button 
                      as={Link} 
                      href="/dashboard/coordination" 
                      variant="outline" 
                      size="lg" 
                      w="full"
                      colorScheme="purple"
                      _hover={{
                        bg: "purple.50",
                        borderColor: "purple.300"
                      }}
                    >
                      Manage Coordination
                    </Button>
                    <Button 
                      as={Link} 
                      href="/dashboard/coordination" 
                      colorScheme="purple" 
                      size="lg" 
                      w="full"
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Create Coordination Set
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Recent Events */}
        <Box w="full" px={{ base: 4, md: 0 }}>
          <Box 
            bg="white" 
            p={8} 
            borderRadius="2xl" 
            shadow="lg"
            border="1px solid"
            borderColor="gray.100"
          >
            <HStack 
              justify="space-between" 
              align="center" 
              mb={10} 
              flexWrap="wrap" 
              gap={6}
              pb={6}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Box>
                <Heading size="lg" mb={3} color="gray.800">Recent Events</Heading>
                <Text color="gray.600" fontSize="md">Your latest event creations</Text>
              </Box>
              <Button 
                as={Link} 
                href="/dashboard/events/new" 
                colorScheme="teal" 
                size="lg" 
                px={8}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "lg"
                }}
                transition="all 0.2s"
              >
                Create New Event
              </Button>
            </HStack>

            {items.length === 0 ? (
              <Box textAlign="center" py={20} px={8}>
                <Text fontSize="xl" color="gray.500" mb={8} fontWeight="500">
                  You haven't created any events yet
                </Text>
                <Button 
                  as={Link} 
                  href="/dashboard/events/new" 
                  colorScheme="teal" 
                  size="lg" 
                  px={10}
                  py={6}
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg"
                  }}
                  transition="all 0.2s"
                >
                  Create Your First Event
                </Button>
              </Box>
            ) : (
              <Box>
                <EventGrid items={items.slice(0, 6)} isAdminView={true} />
              </Box>
            )}
          </Box>
        </Box>
      </VStack>
    </Container>
  );
  } catch (error) {
    console.error("Dashboard error:", error);
    throw error;
  }
}
