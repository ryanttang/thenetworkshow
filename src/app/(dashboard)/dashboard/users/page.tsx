"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
  HStack,
  VStack,
  Spinner,
  Center,
  Card,
  CardBody,
  CardHeader,
  Flex,
  useBreakpointValue,
  Stack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, EmailIcon, CalendarIcon, RepeatIcon } from "@chakra-ui/icons";
import { UserForm } from "@/components/users/UserForm";
import { Role } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", sm: "4xl", lg: "7xl" });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle create user
  const handleCreateUser = () => {
    setSelectedUser(null);
    onFormOpen();
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onFormOpen();
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    onDeleteOpen();
  };

  // Handle reset password
  const handleResetPassword = (userId: string) => {
    setResetUserId(userId);
    onResetOpen();
  };

  // Confirm password reset
  const confirmResetPassword = async () => {
    if (!resetUserId) return;

    try {
      const response = await fetch(`/api/admin/users/${resetUserId}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }

      const result = await response.json();
      
      toast({
        title: "Password Reset",
        description: `Password reset successfully. New temporary password: ${result.temporaryPassword}`,
        status: "success",
        duration: 8000,
      });

      // Note: Store this password temporarily or share with user securely
      console.log("New temporary password:", result.temporaryPassword);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        status: "error",
        duration: 5000,
      });
    } finally {
      onResetClose();
      setResetUserId(null);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
        status: "success",
        duration: 3000,
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        status: "error",
        duration: 5000,
      });
    } finally {
      onDeleteClose();
      setDeleteUserId(null);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    onFormClose();
    setSelectedUser(null);
    await fetchUsers();
  };

  // Get role badge color
  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "ORGANIZER":
        return "blue";
      case "VIEWER":
        return "green";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW={containerMaxW} py={8} px={4}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex 
          direction={isMobile ? "column" : "row"} 
          justify="space-between" 
          align={isMobile ? "stretch" : "center"}
          gap={4}
        >
          <Heading 
            size={isMobile ? "md" : "lg"}
            color="gray.800"
            fontFamily="'SUSE Mono', monospace"
            fontWeight="600"
            textAlign={isMobile ? "center" : "left"}
          >
            User Management
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreateUser}
            size={isMobile ? "md" : "md"}
            width={isMobile ? "100%" : "auto"}
          >
            {isMobile ? "Add User" : "Add User"}
          </Button>
        </Flex>

        {/* Users List - Responsive */}
        {isMobile ? (
          /* Mobile Card Layout */
          <Wrap spacing={4} justify="center">
            {users.map((user) => (
              <WrapItem key={user.id} width="100%">
                <Card width="100%" shadow="sm" borderRadius="lg" border="1px" borderColor="gray.100">
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">
                        {user.name}
                      </Text>
                      <Badge colorScheme={getRoleBadgeColor(user.role)} fontSize="xs">
                        {user.role}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="stretch" spacing={3}>
                      <Flex align="center" gap={2}>
                        <EmailIcon color="gray.500" />
                        <Text fontSize="sm" color="gray.600" textAlign="left">
                          {user.email}
                        </Text>
                      </Flex>
                      <Flex align="center" gap={2}>
                        <CalendarIcon color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          Created: {new Date(user.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </Flex>
                      <HStack justify="flex-end" spacing={2} mt={2} wrap="wrap">
                        <Button
                          leftIcon={<EditIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => handleEditUser(user)}
                          minW="60px"
                        >
                          Edit
                        </Button>
                        <Button
                          leftIcon={<RepeatIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="green"
                          onClick={() => handleResetPassword(user.id)}
                          minW="60px"
                        >
                          Reset
                        </Button>
                        <Button
                          leftIcon={<DeleteIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => handleDeleteUser(user.id)}
                          minW="60px"
                        >
                          Delete
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          /* Desktop Table Layout */
          <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td fontWeight="medium">{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit user"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEditUser(user)}
                        />
                        <IconButton
                          aria-label="Reset password"
                          icon={<RepeatIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="green"
                          onClick={() => handleResetPassword(user.id)}
                        />
                        <IconButton
                          aria-label="Delete user"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteUser(user.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* User Form Modal */}
        <UserForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          user={selectedUser}
          onSuccess={handleFormSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          leastDestructiveRef={cancelRef}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete User
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this user? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Password Reset Confirmation Dialog */}
        <AlertDialog
          isOpen={isResetOpen}
          onClose={onResetClose}
          leastDestructiveRef={cancelRef}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Reset User Password
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to reset the password for this user? 
                This will generate a new temporary password that you can share with the user. 
                The user will need to create a new password on their next login.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onResetClose}>
                  Cancel
                </Button>
                <Button colorScheme="green" onClick={confirmResetPassword} ml={3}>
                  Reset Password
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Container>
  );
}
