"use client";

import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  useToast,
  Spinner,
  Flex,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon, EmailIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscribersResponse {
  subscribers: Subscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  
  const toast = useToast();

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        search,
        activeOnly: activeOnly.toString(),
      });

      const response = await fetch(`/api/subscribers?${params}`);
      const data: SubscribersResponse = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch subscribers",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscribers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, search, activeOnly]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "10000", // Get all subscribers
        search,
        activeOnly: activeOnly.toString(),
      });

      const response = await fetch(`/api/subscribers?${params}`);
      const data: SubscribersResponse = await response.json();

      if (response.ok) {
        // Create CSV content
        const csvContent = [
          "Email,Status,Subscribed Date",
          ...data.subscribers.map(sub => 
            `${sub.email},${sub.isActive ? 'Active' : 'Inactive'},"${new Date(sub.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}"`
          )
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: `Exported ${data.subscribers.length} subscribers`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to export subscribers",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export subscribers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter both subject and content",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEmailLoading(true);
    try {
      const activeSubscribers = subscribers.filter(s => s.isActive);
      const emails = activeSubscribers.map(s => s.email).join(',');
      
      // Create mailto link
      const mailtoLink = `mailto:${emails}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;
      window.open(mailtoLink);
      
      setEmailModalOpen(false);
      setEmailSubject("");
      setEmailContent("");
      
      toast({
        title: "Success",
        description: `Opened email client with ${activeSubscribers.length} recipients`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open email client",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Event Subscribers
          </Heading>
          <Text color="gray.600">
            Manage and export your event invitation subscribers
          </Text>
        </Box>

        {/* Controls */}
        <Box>
          <HStack spacing={4} mb={6} flexWrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </InputGroup>

            <Select
              value={activeOnly.toString()}
              onChange={(e) => setActiveOnly(e.target.value === "true")}
              maxW="200px"
            >
              <option value="true">Active Only</option>
              <option value="false">All Subscribers</option>
            </Select>

            <Button
              leftIcon={<DownloadIcon />}
              onClick={handleExport}
              isLoading={exportLoading}
              loadingText="Exporting..."
              colorScheme="green"
              variant="outline"
            >
              Export CSV
            </Button>

            <Button
              leftIcon={<EmailIcon />}
              onClick={() => setEmailModalOpen(true)}
              colorScheme="blue"
              variant="outline"
              isDisabled={subscribers.filter(s => s.isActive).length === 0}
            >
              Email Subscribers
            </Button>
          </HStack>

          <HStack justify="space-between" align="center">
            <Text color="gray.600" fontSize="sm">
              {loading ? "Loading..." : `${total} total subscribers`}
            </Text>
            
            {pages > 1 && (
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  isDisabled={page === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {page} of {pages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  isDisabled={page === pages}
                >
                  Next
                </Button>
              </HStack>
            )}
          </HStack>
        </Box>

        {/* Table */}
        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
          {loading ? (
            <Flex justify="center" py={20}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Subscribed Date</Th>
                  <Th>Last Updated</Th>
                </Tr>
              </Thead>
              <Tbody>
                {subscribers.map((subscriber) => (
                  <Tr key={subscriber.id}>
                    <Td fontFamily="mono" fontSize="sm">
                      {subscriber.email}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={subscriber.isActive ? "green" : "gray"}
                        variant="subtle"
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {new Date(subscriber.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {new Date(subscriber.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {!loading && subscribers.length === 0 && (
            <Box textAlign="center" py={20}>
              <Text color="gray.500" fontSize="lg">
                No subscribers found
              </Text>
            </Box>
          )}
        </Box>
      </VStack>

      {/* Email Modal */}
      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Subscribers</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                This will open your email client with {subscribers.filter(s => s.isActive).length} active subscribers.
              </Text>
              
              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  Subject
                </Text>
                <Input
                  placeholder="Email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  Message
                </Text>
                <Textarea
                  placeholder="Email content..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={8}
                />
              </Box>

              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="ghost"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSendEmail}
                  isLoading={emailLoading}
                  loadingText="Opening..."
                >
                  Open Email Client
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
