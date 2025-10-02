"use client";

import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  Text, 
  List, 
  ListItem, 
  ListIcon, 
  Badge, 
  HStack, 
  Divider, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader 
} from "@chakra-ui/react";
import { 
  MdEvent, 
  MdCollections, 
  MdVideoLibrary, 
  MdArrowForward, 
  MdCheckCircle, 
  MdInfo 
} from "react-icons/md";

export default function HelpGuidesPage() {
  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4} color="green.600" fontFamily="SUSE Mono">
            Help & Guides
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Quick reference guides for THC Members Only Club staff
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Events Management Card */}
          <Card bg="green.50" borderLeft="4px" borderLeftColor="green.600">
            <CardHeader pb={2}>
              <HStack spacing={3}>
                <MdEvent size={24} color="#38a169" />
                <Box>
                  <Heading size="md" fontFamily="SUSE Mono" color="green.600">
                    Events Management
                  </Heading>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={3} color="green.700" fontFamily="SUSE Mono">
                    Creating a New Event
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Go to <Badge colorScheme="green">Dashboard → Events</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Click <Badge colorScheme="blue">Create New Event</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Fill in <strong>Title</strong> and <strong>Description</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Set <strong>Date & Time</strong> (California timezone automatic)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Add <strong>Location</strong> details (venue name, address)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Upload a <strong>Hero Image</strong> for the event card
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Choose ticket button type: <Badge>RSVP</Badge> or <Badge>Buy Tickets</Badge>
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="green.700" fontFamily="SUSE Mono">
                    Event Status & Publishing
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      <Badge colorScheme="gray">DRAFT</Badge> - Event is saved but not visible to members
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="green.500" />
                      <Badge colorScheme="green">PUBLISHED</Badge> - Event appears on website
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="orange.500" />
                      <Badge colorScheme="orange">ARCHIVED</Badge> - Past event, hidden from main view
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="green.700" fontFamily="SUSE Mono">
                    Adding Event Photos
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Click on any event to open its detail page
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Use <Badge colorScheme="purple">Upload Details Images</Badge> button
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="green.500" />
                      Drag & drop images or click to browse
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Images auto-optimize for mobile and desktop
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Coordination Hub Card */}
          <Card bg="blue.50" borderLeft="4px" borderLeftColor="blue.600">
            <CardHeader pb={2}>
              <HStack spacing={3}>
                <MdInfo size={24} color="#3182ce" />
                <Box>
                  <Heading size="md" fontFamily="SUSE Mono" color="blue.600">
                    Coordination Hub
                  </Heading>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={3} color="blue.700" fontFamily="SUSE Mono">
                    Creating Coordination Documents
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Go to <Badge colorScheme="blue">Dashboard → Coordination</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Click <Badge colorScheme="green">Create New Coordination</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Select the associated <strong>Event</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Add <strong>Title</strong>, <strong>Description</strong>, and <strong>Notes</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Include <strong>Point of Contacts</strong> (names, phones, emails)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Save to get a unique <Badge colorScheme="purple">Share Token</Badge>
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="blue.700" fontFamily="SUSE Mono">
                    Adding Documents
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Click on your coordination item to open details
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Click <Badge colorScheme="blue">Add Document</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Choose document type: <Badge>Map</Badge>, <Badge>Schedule</Badge>, <Badge>Itinerary</Badge>, etc.
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Upload files (PDF, images, etc.)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Add titles and descriptions for each document
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="blue.700" fontFamily="SUSE Mono">
                    Sharing with Members
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdInfo} color="green.500" />
                      You'll get a unique <Badge colorScheme="purple">Share Link</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="blue.500" />
                      Share this link with specific members via text/email
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Only people with the link can see these private documents
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      No member login required - works with just the link!
                    </ListItem>
                  </List>
                </Box>

                <Box bg="yellow.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="yellow.400">
                  <Text fontSize="sm" color="yellow.800">
                    <strong>Pro Tip:</strong> Create coordination documents for each event - perfect for sharing event maps, schedules, vendor information, and special instructions with your team members.
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Video Management Card */}
          <Card bg="purple.50" borderLeft="4px" borderLeftColor="purple.600">
            <CardHeader pb={2}>
              <HStack spacing={3}>
                <MdVideoLibrary size={24} color="#805ad5" />
                <Box>
                  <Heading size="md" fontFamily="SUSE Mono" color="purple.600">
                    Video Management
                  </Heading>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={3} color="purple.700" fontFamily="SUSE Mono">
                    Adding New Videos
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Go to <Badge colorScheme="purple">Dashboard → Videos</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Click <Badge colorScheme="green">Add New Video</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Add <strong>Title</strong> and <strong>Caption</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Choose video type: <Badge>Upload File</Badge> or <Badge>External Link</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Upload file or paste YouTube/Vimeo link
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Set display order (top-to-bottom)
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="purple.700" fontFamily="SUSE Mono">
                    Video Settings
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      <Badge colorScheme="green">Auto-play</Badge> - Videos start automatically
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      <Badge colorScheme="green">Loop</Badge> - Videos repeat continuously
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      <Badge colorScheme="green">Muted</Badge> - Videos play without sound initially
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      These settings ensure good user experience on mobile and desktop
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="purple.700" fontFamily="SUSE Mono">
                    Managing Video Display
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Videos appear in order on the public homepage
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Use the <strong>Sort Order</strong> to arrange which appears first
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="purple.500" />
                      Toggle <Badge colorScheme="green">Published</Badge> to show/hide videos
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Only published videos appear on the main website
                    </ListItem>
                  </List>
                </Box>

                <Box bg="purple.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="purple.400">
                  <Text fontSize="sm" color="purple.800">
                    <strong>Best Practices:</strong> Keep videos under 30 seconds for best engagement. Upload high-quality but compressed videos for faster loading.
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Gallery Management Card */}
          <Card bg="orange.50" borderLeft="4px" borderLeftColor="orange.600">
            <CardHeader pb={2}>
              <HStack spacing={3}>
                <MdCollections size={24} color="#dd6b20" />
                <Box>
                  <Heading size="md" fontFamily="SUSE Mono" color="orange.600">
                    Gallery Management
                  </Heading>
                </Box>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={3} color="orange.700" fontFamily="SUSE Mono">
                    Creating New Galleries
                  </Heading>
                  <List spacing={2}>
                    <ListItem>


                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Go to <Badge colorScheme="orange">Dashboard → Gallery</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Click <Badge colorScheme="green">Create New Gallery</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Add <strong>Gallery Name</strong> (e.g., "Summer Events 2024")
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Add <strong>Description</strong> (appears below title)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Optionally link to a specific <strong>Event</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Add <strong>Tags</strong> for easy filtering (e.g., "summer", "2024", "outdoor")
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="orange.700" fontFamily="SUSE Mono">
                    Adding Photos to Galleries
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Click on any gallery to open it
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Click <Badge colorScheme="blue">Add Images</Badge>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Choose images from your uploaded files or upload new ones
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Add individual <strong>titles</strong> and <strong>captions</strong>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Set <strong>sort order</strong> to arrange display sequence
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Images automatically optimize for web viewing
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="orange.700" fontFamily="SUSE Mono">
                    Gallery Organization
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdInfo} color="blue.500" />
                      Use <strong>tags</strong> to group related galleries
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Public visitors can filter galleries by tags
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Make galleries <Badge colorScheme="green">Public</Badge> to show on website
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdInfo} color="gray.500" />
                      Private galleries are hidden from public view
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={3} color="orange.700" fontFamily="SUSE Mono">
                    Gallery Display
                  </Heading>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Galleries appear on the public website gallery page
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Visitors can browse by tags and preview images
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdArrowForward} color="orange.500" />
                      Individual galleries have dedicated pages with full-size photos
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      Perfect for showcasing club atmosphere and past events
                    </ListItem>
                  </List>
                </Box>

                <Box bg="orange.50" p={4} borderRadius="md" borderLeft="4px" borderLeftColor="orange.400">
                  <Text fontSize="sm" color="orange.800">
                    <strong>Pro Tip:</strong> Create separate galleries for different themes - "Venue Tours", "Member Photos", "Event Highlights", etc. This helps visitors easily find what they're interested in.
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Tips Section */}
        <Box mt={8} p={6} bg="green.50" borderRadius="lg" borderLeft="4px" borderLeftColor="green.400">
          <Heading size="md" mb={4} color="green.700" fontFamily="SUSE Mono">
            Quick Staff Tips
          </Heading>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm">
              <strong>Mobile First:</strong> Always check how things look on mobile - most members will use phones
            </Text>
            <Text fontSize="sm">
              <strong>Security:</strong> Use Coordination documents for sensitive event info (vendor details, special instructions)
            </Text>
            <Text fontSize="sm">
              <strong>Image Quality:</strong> Upload high-resolution images - the system automatically optimizes them
            </Text>
            <Text fontSize="sm">
              <strong>Time Zones:</strong> All events automatically use California timezone - no manual conversion needed
            </Text>
            <Text fontSize="sm">
              <strong>Public vs Private:</strong> Remember to publish events and make galleries public for visitors to see
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}