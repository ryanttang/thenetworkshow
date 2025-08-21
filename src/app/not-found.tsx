import { Box, Heading, Text, Button, VStack, Container } from '@chakra-ui/react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="2xl" color="gray.500">
          404 - Page Not Found
        </Heading>
        
        <Text fontSize="lg" color="gray.600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Text>
        
        <Box>
          <Button 
            as={Link}
            href="/"
            colorScheme="blue" 
            size="lg"
            mr={4}
          >
            Go home
          </Button>
          
          <Button 
            as={Link}
            href="/events"
            variant="outline" 
            size="lg"
          >
            Browse events
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
