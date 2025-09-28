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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

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
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            User Management
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </HStack>

        {/* Users Table */}
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
      </VStack>
    </Container>
  );
}
