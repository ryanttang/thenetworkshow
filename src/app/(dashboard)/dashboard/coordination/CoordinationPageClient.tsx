"use client";

import { 
  VStack, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardBody, 
  HStack, 
  Box
} from "@chakra-ui/react";
import CoordinationForm from "@/components/coordination/CoordinationForm";
import CoordinationCard from "@/components/coordination/CoordinationCard";

interface Event {
  id: string;
  title: string;
  slug: string;
  startAt: Date;
}

interface Coordination {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  shareToken: string;
  isActive: boolean;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    slug: string;
    startAt: Date;
  };
  documents: any[];
  _count: {
    documents: number;
  };
}

interface CoordinationPageClientProps {
  coordinations: Coordination[];
  events: Event[];
  canManageAllEvents: boolean;
}

export default function CoordinationPageClient({ 
  coordinations, 
  events, 
  canManageAllEvents 
}: CoordinationPageClientProps) {
  const handleRefresh = () => {
    // Refresh the page to show the new coordination set
    window.location.reload();
  };

  return (
    <Box maxW="6xl" mx="auto">
      <VStack align="stretch" spacing={6} py={4}>
        {/* Header */}
        <Box textAlign="center" px={{ base: 4, md: 0 }}>
          <Heading 
            size={{ base: "xl", md: "2xl" }} 
            mb={3} 
            color="gray.800"
            fontWeight="700"
            lineHeight="1.2"
            fontFamily="'SUSE Mono', monospace"
          >
            Event Coordination
          </Heading>
          <Text 
            color="gray.600" 
            fontSize={{ base: "md", md: "lg" }} 
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
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} px={{ base: 4, md: 0 }}>
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" py={6}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.600" mb={2}>
                {coordinations.length}
              </Text>
              <Text color="gray.600" fontWeight="medium" fontSize="sm">
                Coordination Sets
              </Text>
            </CardBody>
          </Card>
          
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" py={6}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="green.600" mb={2}>
                {coordinations.reduce((sum: number, c: any) => sum + c._count.documents, 0)}
              </Text>
              <Text color="gray.600" fontWeight="medium" fontSize="sm">
                Total Documents
              </Text>
            </CardBody>
          </Card>
          
          <Card shadow="sm" borderRadius="lg">
            <CardBody textAlign="center" py={6}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="purple.600" mb={2}>
                {events.length}
              </Text>
              <Text color="gray.600" fontWeight="medium" fontSize="sm">
                Available Events
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Coordination List */}
        <Box px={{ base: 4, md: 0 }}>
          <VStack spacing={4} align="stretch" mb={6}>
            <HStack justify="space-between" align={{ base: "flex-start", md: "center" }} flexWrap="wrap" gap={4}>
              <Box>
                <Heading 
                  size={{ base: "md", md: "lg" }} 
                  color="gray.800"
                  fontFamily="'SUSE Mono', monospace"
                  fontWeight="600"
                >
                  Coordination Sets
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Manage documents and shareable links for event coordination
                </Text>
              </Box>
              <CoordinationForm events={events} onSuccess={handleRefresh} />
            </HStack>
          </VStack>

          {coordinations.length === 0 ? (
            <Card shadow="md" borderRadius="xl">
              <CardBody textAlign="center" py={12}>
                <Text fontSize={{ base: "lg", md: "xl" }} color="gray.500" mb={6} fontWeight="500">
                  No coordination sets created yet
                </Text>
                <Text color="gray.400" mb={6} fontSize="sm">
                  Create your first coordination set to start organizing event documents
                </Text>
                <CoordinationForm events={events} onSuccess={handleRefresh} />
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {coordinations.map((coordination: any) => (
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
    </Box>
  );
}
