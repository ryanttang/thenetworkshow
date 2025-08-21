'use client';

import { useEffect } from 'react';
import { Box, Heading, Text, Button, VStack, Container } from '@chakra-ui/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="2xl" color="red.500">
          Something went wrong!
        </Heading>
        
        <Text fontSize="lg" color="gray.600">
          {error.message || 'An unexpected error occurred'}
        </Text>
        
        <Box>
          <Button 
            colorScheme="blue" 
            onClick={reset}
            size="lg"
            mr={4}
          >
            Try again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            size="lg"
          >
            Go home
          </Button>
        </Box>
        
        {process.env.NODE_ENV === 'development' && (
          <Box 
            bg="gray.100" 
            p={4} 
            borderRadius="md" 
            textAlign="left" 
            w="full"
            maxH="60"
            overflow="auto"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Error Details (Development):
            </Text>
            <Text fontSize="xs" fontFamily="mono">
              {error.stack}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
