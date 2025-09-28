"use client";

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { EmailIcon } from "@chakra-ui/icons";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="blue.50" py={8}>
      <Container maxW="2xl">
        <VStack spacing={4} textAlign="center">
          <Box as="form" onSubmit={handleSubmit} w="full">
            <Flex gap={3} align="stretch">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="white"
                border="2px"
                borderColor="blue.200"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                }}
                _placeholder={{
                  color: "gray.400",
                }}
                size="md"
                flex={1}
              />
              <Button
                type="submit"
                colorScheme="blue"
                size="md"
                px={6}
                isLoading={isLoading}
                loadingText="Subscribing..."
                leftIcon={<EmailIcon />}
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "lg",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.2s ease"
              >
                Subscribe
              </Button>
            </Flex>
          </Box>

          <Text fontSize="xs" color="gray.500" maxW="md">
            We respect your privacy and will only use your email to send you event invitations. 
            You can unsubscribe at any time.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
