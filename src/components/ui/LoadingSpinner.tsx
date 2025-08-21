"use client";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = "lg" 
}: LoadingSpinnerProps) {
  return (
    <VStack spacing={4} py={8}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size={size}
      />
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </VStack>
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        textAlign="center"
      >
        <LoadingSpinner message={message} size="xl" />
      </Box>
    </Box>
  );
}
