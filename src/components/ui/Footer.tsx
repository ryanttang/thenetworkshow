import { Box, Container, Text, VStack } from "@chakra-ui/react";

export default function Footer() {
  
  return (
    <Box 
      as="footer" 
      bg="linear-gradient(145deg, rgba(248,250,252,0.95), rgba(255,255,255,0.95))"
      backdropFilter="blur(12px)"
      borderTop="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      py={12} 
      mt={24}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #4facfe 100%)',
        opacity: 0.7
      }}
    >
      <Container maxW="7xl">
        <VStack spacing={6}>
          <Box
            p={4}
            borderRadius="xl"
            bg="rgba(255, 255, 255, 0.5)"
            backdropFilter="blur(8px)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
            maxW="md"
            mx="auto"
          >
            <Text 
              color="gray.700" 
              textAlign="center" 
              fontWeight="500"
              fontSize="md"
            >
              © 2025 THC Members Only Club. All Rights Reserved.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
