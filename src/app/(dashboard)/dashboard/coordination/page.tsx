import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Container, 
  VStack, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  HStack, 
  Box, 
  Badge, 
  Button, 
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Spinner,
  Center
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import CoordinationForm from "@/components/coordination/CoordinationForm";
import CoordinationCard from "@/components/coordination/CoordinationCard";

export default async function CoordinationPage() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) redirect("/signin");
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!user) redirect("/signin");
  
  // Admins and Organizers can see all coordinations, others only see their own
  const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";
  
  const coordinations = await prisma.coordination.findMany({ 
    where: { 
      ...(canManageAllEvents ? {} : { event: { ownerId: user.id } })
    }, 
    include: { 
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          owner: { select: { name: true, email: true } }
        }
      },
      documents: true,
      _count: {
        select: { documents: true }
      }
    }, 
    orderBy: { createdAt: "desc" }
  });

  const events = await prisma.event.findMany({
    where: {
      ...(canManageAllEvents ? {} : { ownerId: user.id }),
      status: { not: "ARCHIVED" }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      startAt: true,
      owner: { select: { name: true, email: true } }
    },
    orderBy: { startAt: "desc" }
  });

  return (
    <Container maxW="full" px={0}>
      <VStack align="stretch" spacing={8} py={8}>
        {/* Header */}
        <Box textAlign="center" px={{ base: 4, md: 0 }}>
          <Heading 
            size="2xl" 
            mb={4} 
            color="gray.800"
            fontWeight="700"
            lineHeight="1.2"
            fontFamily="'SUSE Mono', monospace"
          >
            Event Coordination
          </Heading>
          <Text 
            color="gray.600" 
            fontSize="lg" 
            fontWeight="500"
            maxW="2xl"
            lineHeight="1.6"
            mx="auto"
          >
            {canManageAllEvents 
              ? "Manage coordination documents, maps, schedules, and shareable links for all events" 
              : "Manage coordination documents, maps, schedules, and shareable links for your events"
            }
          </Text>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} px={{ base: 4, md: 0 }}>
          <Card shadow="md" borderRadius="xl">
            <CardBody textAlign="center" py={8}>
              <Text fontSize="3xl" fontWeight="bold" color="blue.600" mb={2}>
                {coordinations.length}
              </Text>
              <Text color="gray.600" fontWeight="medium">
                Coordination Sets
              </Text>
            </CardBody>
          </Card>
          
          <Card shadow="md" borderRadius="xl">
            <CardBody textAlign="center" py={8}>
              <Text fontSize="3xl" fontWeight="bold" color="green.600" mb={2}>
                {coordinations.reduce((sum, c) => sum + c._count.documents, 0)}
              </Text>
              <Text color="gray.600" fontWeight="medium">
                Total Documents
              </Text>
            </CardBody>
          </Card>
          
          <Card shadow="md" borderRadius="xl">
            <CardBody textAlign="center" py={8}>
              <Text fontSize="3xl" fontWeight="bold" color="purple.600" mb={2}>
                {events.length}
              </Text>
              <Text color="gray.600" fontWeight="medium">
                Available Events
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Coordination List */}
        <Box px={{ base: 4, md: 0 }}>
          <HStack justify="space-between" align="center" mb={8}>
            <Box>
              <Heading 
                size="lg" 
                color="gray.800"
                fontFamily="'SUSE Mono', monospace"
                fontWeight="600"
              >
                Coordination Sets
              </Heading>
              <Text color="gray.600" fontSize="md">
                Manage documents and shareable links for event coordination
              </Text>
            </Box>
            <CoordinationForm events={events} />
          </HStack>

          {coordinations.length === 0 ? (
            <Card shadow="lg" borderRadius="2xl">
              <CardBody textAlign="center" py={20}>
                <Text fontSize="xl" color="gray.500" mb={8} fontWeight="500">
                  No coordination sets created yet
                </Text>
                <Text color="gray.400" mb={8}>
                  Create your first coordination set to start organizing event documents
                </Text>
                <CoordinationForm events={events} />
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {coordinations.map((coordination) => (
                <CoordinationCard 
                  key={coordination.id} 
                  coordination={coordination}
                  events={events}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  );
}
