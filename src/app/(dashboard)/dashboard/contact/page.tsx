"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon, EmailIcon, DeleteIcon } from "@chakra-ui/icons";
import { useRef } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  respondedAt: string | null;
  response: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactFilters {
  search: string;
  isRead: string;
  dateRange: string;
}

export default function ContactDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>({
    search: "",
    isRead: "all",
    dateRange: "all",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, filters]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/contact");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchLower) ||
          msg.email.toLowerCase().includes(searchLower) ||
          (msg.subject && msg.subject.toLowerCase().includes(searchLower)) ||
          msg.message.toLowerCase().includes(searchLower)
      );
    }

    // Read status filter
    if (filters.isRead !== "all") {
      const isRead = filters.isRead === "read";
      filtered = filtered.filter((msg) => msg.isRead === isRead);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((msg) => new Date(msg.createdAt) >= cutoffDate);
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/contact/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        );
        toast({
          title: "Message marked as read",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setSendingResponse(true);
    try {
      const response = await fetch(`/api/admin/contact/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: responseText,
          respondedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === selectedMessage.id
              ? {
                  ...msg,
                  response: responseText,
                  respondedAt: new Date().toISOString(),
                }
              : msg
          )
        );
        toast({
          title: "Response sent successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        setResponseText("");
      } else {
        throw new Error("Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: "Failed to send response",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Subject",
      "Message",
      "Is Read",
      "Response",
      "Responded At",
      "Created At",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredMessages.map((msg) =>
        [
          msg.id,
          `"${msg.name}"`,
          `"${msg.email}"`,
          `"${msg.subject || ""}"`,
          `"${msg.message.replace(/"/g, '""')}"`,
          msg.isRead ? "Yes" : "No",
          `"${msg.response || ""}"`,
          msg.respondedAt || "",
          msg.createdAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV exported successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const openResponseModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setResponseText(message.response || "");
    onOpen();
  };

  const deleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    try {
      const response = await fetch(`/api/admin/contact/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        toast({
          title: "Message deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingMessage(null);
      onDeleteClose();
    }
  };

  const openDeleteDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    onDeleteOpen();
  };

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  if (loading) {
    return (
      <Container maxW="7xl">
        <VStack spacing={8} py={16}>
          <Spinner size="xl" />
          <Text>Loading contact messages...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl">
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading 
            size="xl" 
            mb={2}
            fontFamily="'SUSE Mono', monospace"
            fontWeight="600"
          >
            Contact Messages
          </Heading>
          <Text color="gray.600">
            Manage and respond to visitor inquiries
            {unreadCount > 0 && (
              <Badge ml={2} colorScheme="red">
                {unreadCount} unread
              </Badge>
            )}
          </Text>
        </Box>

        {/* Filters and Actions */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <VStack spacing={4}>
            <HStack spacing={4} width="full" flexWrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </InputGroup>

              <Select
                maxW="200px"
                value={filters.isRead}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, isRead: e.target.value }))
                }
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </Select>

              <Select
                maxW="200px"
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                }
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>

              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="green"
                onClick={exportToCSV}
                ml="auto"
              >
                Export CSV
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Messages Table */}
        <Box
          bg="white"
          borderRadius="lg"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          overflow="hidden"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredMessages.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Text color="gray.500">No messages found</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredMessages.map((message) => (
                    <Tr
                      key={message.id}
                      bg={!message.isRead ? "blue.50" : "white"}
                      _hover={{ bg: !message.isRead ? "blue.100" : "gray.50" }}
                    >
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{message.name}</Text>
                          {!message.isRead && (
                            <Badge colorScheme="blue" size="sm">
                              New
                            </Badge>
                          )}
                        </VStack>
                      </Td>
                      <Td>{message.email}</Td>
                      <Td>
                        <Text maxW="200px" isTruncated>
                          {message.subject || "No subject"}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Badge
                            colorScheme={message.isRead ? "green" : "orange"}
                          >
                            {message.isRead ? "Read" : "Unread"}
                          </Badge>
                          {message.response && (
                            <Badge colorScheme="purple" size="sm">
                              Responded
                            </Badge>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(message.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMessage(message);
                                onOpen();
                              }}
                            >
                              View
                            </Button>
                          </Tooltip>
                          <Tooltip label="Send Response">
                            <IconButton
                              aria-label="Send Response"
                              size="sm"
                              icon={<EmailIcon />}
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => openResponseModal(message)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete Message">
                            <IconButton
                              aria-label="Delete Message"
                              size="sm"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="outline"
                              onClick={() => openDeleteDialog(message)}
                              isLoading={deletingMessage === message.id}
                            />
                          </Tooltip>
                          {!message.isRead && (
                            <Tooltip label="Mark as Read">
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => markAsRead(message.id)}
                              >
                                Mark Read
                              </Button>
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </VStack>

      {/* Message Details/Response Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMessage ? `Message from ${selectedMessage.name}` : "Message Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMessage && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>Contact Information:</Text>
                  <Text>Name: {selectedMessage.name}</Text>
                  <Text>Email: {selectedMessage.email}</Text>
                  <Text>Date: {new Date(selectedMessage.createdAt).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</Text>
                </Box>

                {selectedMessage.subject && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Subject:</Text>
                    <Text>{selectedMessage.subject}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="medium" mb={2}>Message:</Text>
                  <Text
                    bg="gray.50"
                    p={3}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                  >
                    {selectedMessage.message}
                  </Text>
                </Box>

                {selectedMessage.response && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Previous Response:</Text>
                    <Text
                      bg="blue.50"
                      p={3}
                      borderRadius="md"
                      whiteSpace="pre-wrap"
                    >
                      {selectedMessage.response}
                    </Text>
                    {selectedMessage.respondedAt && (
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        Responded on: {new Date(selectedMessage.respondedAt).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Text>
                    )}
                  </Box>
                )}

                <FormControl>
                  <FormLabel>Response:</FormLabel>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={6}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={sendResponse}
              isLoading={sendingResponse}
              loadingText="Sending..."
              isDisabled={!responseText.trim()}
            >
              Send Response
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Contact Message
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this message from{" "}
              <strong>{selectedMessage?.name}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => selectedMessage && deleteMessage(selectedMessage.id)}
                ml={3}
                isLoading={deletingMessage === selectedMessage?.id}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}
