'use client';

import { useEffect } from 'react';
import { Box, Heading, Text, Button, VStack, Container, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [serverReport, setServerReport] = useState<any | null>(null);

  useEffect(() => {
    console.error('Global error caught:', error);
    const payload = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      digest: (error as any)?.digest,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      extra: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }
    };
    fetch('/api/debug/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    // Also try to fetch any matching server-side report by digest to surface details in prod
    const digest = (error as any)?.digest;
    if (digest) {
      fetch(`/api/debug/error-report?digest=${encodeURIComponent(String(digest))}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.count > 0) setServerReport(data.matches?.[0] ?? null);
        })
        .catch(() => {});
    }
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
              Error Details (Development):
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

            {serverReport && (
              <>
                <Text fontSize="sm" fontWeight="bold" mt={4} mb={2}>
                  Server Report Snapshot:
                </Text>
                <Text fontSize="xs" fontFamily="mono">
                  {JSON.stringify({
                    digest: serverReport.digest,
                    xRequestId: serverReport.xRequestId,
                    vercelId: serverReport.vercelId,
                    pathname: serverReport.pathname,
                    timestamp: serverReport.timestamp,
                  }, null, 2)}
                </Text>
              </>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
}
