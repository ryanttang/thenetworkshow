'use client';

import { Box, Heading, Text, Button, VStack, Container, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const payload = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      digest: (error as any)?.digest,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      extra: {
        boundary: 'global-error',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }
    };
    fetch('/api/debug/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

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

            {(process.env.NODE_ENV === 'development' || (error as any)?.digest) && (
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
                  Error Details:
                </Text>
                {!!(error as any)?.digest && (
                  <HStack justifyContent="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">Digest:</Text>
                    <HStack>
                      <Text fontSize="xs" fontFamily="mono">{(error as any).digest}</Text>
                      <Tooltip label={copied ? 'Copied' : 'Copy digest'}>
                        <IconButton
                          aria-label="Copy digest"
                          size="xs"
                          variant="ghost"
                          icon={copied ? <CheckIcon /> : <CopyIcon />}
                          onClick={() => {
                            navigator.clipboard.writeText(String((error as any).digest || '')).then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1200);
                            });
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                )}
                <Text fontSize="xs" fontFamily="mono">
                  {error.stack}
                </Text>
              </Box>
            )}
          </VStack>
        </Container>
      </body>
    </html>
  );
}
