'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner
} from '@chakra-ui/react';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Unknown authentication error');

    // If it's a rate limit error, start countdown
    if (errorParam === 'RateLimit') {
      setCountdown(15 * 60); // 15 minutes in seconds
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [searchParams]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getErrorMessage = () => {
    switch (error) {
      case 'RateLimit':
        return {
          title: 'Too Many Attempts',
          description: 'You have exceeded the maximum number of sign-in attempts. Please wait before trying again.',
          status: 'warning' as const
        };
      case 'CredentialsSignin':
        return {
          title: 'Sign In Failed',
          description: 'Invalid email or password. Please check your credentials and try again.',
          status: 'error' as const
        };
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          status: 'error' as const
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this application.',
          status: 'error' as const
        };
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication. Please try again.',
          status: 'error' as const
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="2xl" color="red.500">
          Authentication Error
        </Heading>
        
        <Alert status={errorInfo.status} borderRadius="md" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>{errorInfo.title}</AlertTitle>
            <AlertDescription>
              {errorInfo.description}
            </AlertDescription>
          </Box>
        </Alert>

        {error === 'RateLimit' && countdown > 0 && (
          <Box 
            bg="orange.100" 
            p={4} 
            borderRadius="md" 
            border="1px solid" 
            borderColor="orange.300"
          >
            <Text fontWeight="bold" color="orange.800">
              Time remaining: {formatTime(countdown)}
            </Text>
            <Text fontSize="sm" color="orange.700">
              You can try signing in again after this time expires.
            </Text>
          </Box>
        )}

        <VStack spacing={4}>
          {error !== 'RateLimit' && (
            <Button 
              as={Link}
              href="/signin"
              colorScheme="blue" 
              size="lg"
            >
              Try Again
            </Button>
          )}
          
          <Button 
            as={Link}
            href="/"
            variant="outline" 
            size="lg"
          >
            Go Home
          </Button>
        </VStack>

        <Box 
          bg="gray.100" 
          p={4} 
          borderRadius="md" 
          textAlign="left" 
          w="full"
          maxW="md"
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            Demo Accounts:
          </Text>
          <Text fontSize="sm" color="gray.600">
            admin@example.com / admin123!<br />
            organizer@example.com / organizer123!
          </Text>
        </Box>

        {process.env.NODE_ENV === 'development' && (
          <Box 
            bg="gray.100" 
            p={4} 
            borderRadius="md" 
            textAlign="left" 
            w="full"
            maxW="md"
          >
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Debug Info:
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="gray.600">
              Error: {error}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <Container maxW="container.md" py={20}>
        <VStack spacing={8} textAlign="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
