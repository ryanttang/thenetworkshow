"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validation
    if (formData.message.length < 10) {
      toast({
        title: "Message too short",
        description: "Please enter at least 10 characters in your message.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you soon.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle validation errors from server
        if (result.errors && result.errors.length > 0) {
          const errorMessage = result.errors[0].message;
          toast({
            title: "Validation error",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(result.message || "Failed to send message");
        }
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container maxW="2xl" py={16}>
        <VStack spacing={8} textAlign="center">
          <Alert status="success" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Message sent successfully!</AlertTitle>
              <AlertDescription>
                Thank you for reaching out. We'll get back to you as soon as possible.
              </AlertDescription>
            </Box>
          </Alert>
          <Button
            colorScheme="blue"
            onClick={() => setIsSubmitted(false)}
            size="lg"
          >
            Send Another Message
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="2xl" py={16}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Contact Us
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Have a question, comment, or suggestion? We'd love to hear from you!
          </Text>
        </Box>

        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          shadow="md"
          border="1px"
          borderColor="gray.200"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Subject (Optional)</FormLabel>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what's on your mind... (minimum 10 characters)"
                  rows={6}
                  size="lg"
                  resize="vertical"
                  isInvalid={formData.message.length > 0 && formData.message.length < 10}
                />
                {formData.message.length > 0 && formData.message.length < 10 && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    Message must be at least 10 characters ({formData.message.length}/10)
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Sending..."
                isDisabled={formData.message.length < 10}
              >
                Send Message
              </Button>
            </VStack>
          </form>
        </Box>

        <Box textAlign="center" color="gray.500" fontSize="sm">
          <Text>
            We typically respond within 24-48 hours. For urgent matters, please
            reach out through our social media channels.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
