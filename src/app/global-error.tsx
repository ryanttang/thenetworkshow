'use client';

import { Box, Heading, Text, Button, VStack, Container } from '@chakra-ui/react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
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
          </VStack>
        </Container>
      </body>
    </html>
  );
}
