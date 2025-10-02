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
    <Box py={8}>
      <Container maxW="3xl">
        <VStack spacing={8} textAlign="center">
          <Box>
        <Box
          position="relative"
          display="inline-block"
          px={8}
          py={4}
          borderRadius="3xl"
          border="3px solid"
          borderColor="transparent"
          bgGradient="linear(135deg, green.100, teal.100, green.50)"
          _before={{
            content: '""',
            position: "absolute",
            top: "-3px",
            left: "-3px",
            right: "-3px",
            bottom: "-3px",
            borderRadius: "3xl",
            bgGradient: "linear(135deg, green.500, teal.500, green.400)",
            zIndex: -1
          }}
          _after={{
            content: '""',
            position: "absolute",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            borderRadius: "3xl",
            bg: "white",
            zIndex: -1
          }}
        >
          <Heading 
            size={{ base: "md", md: "xl" }} 
            color="black"
            fontWeight="600"
            letterSpacing="tight"
            fontFamily="'SUSE Mono', monospace"
          >
            Stay Connected
          </Heading>
        </Box>
          </Box>
          
          <Box 
            as="form" 
            onSubmit={handleSubmit} 
            w="full" 
            maxW="md" 
            mx="auto"
            p={6}
            borderRadius="2xl"
            border="2px solid"
            borderColor="transparent"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              borderRadius: "2xl",
              bgGradient: "linear(135deg, green.300, teal.300, green.200)",
              zIndex: -1
            }}
            _after={{
              content: '""',
              position: "absolute",
              top: "0px",
              left: "0px",
              right: "0px",
              bottom: "0px",
              borderRadius: "2xl",
              bgGradient: "linear(135deg, green.50, teal.50, white)",
              zIndex: -1
            }}
          >
            <Flex gap={3} align="stretch" direction={{ base: "column", sm: "row" }}>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="white"
                border="2px"
                borderColor="green.200"
                borderRadius="xl"
                _focus={{
                  borderColor: "green.400",
                  boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)",
                }}
                _placeholder={{
                  color: "gray.400",
                }}
                size="lg"
                flex={1}
                py={6}
                px={4}
              />
              <Button
                type="submit"
                size="lg"
                px={8}
                py={6}
                bgGradient="linear(135deg, green.500, green.600)"
                color="white"
                shadow="lg"
                fontWeight="600"
                borderRadius="xl"
                isLoading={isLoading}
                loadingText="Subscribing..."
                leftIcon={<EmailIcon />}
                _hover={{
                  bgGradient: "linear(135deg, green.600, green.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.3s ease-in-out"
                minW={{ base: "full", sm: "auto" }}
              >
                Subscribe
              </Button>
            </Flex>
          </Box>

          <Text fontSize="sm" color="gray.500" maxW="lg" mx="auto">
            We respect your privacy and will only use your email to send you event invitations. 
            You can unsubscribe at any time.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
