"use client";
import { Box, Container, Text, VStack, useColorModeValue } from "@chakra-ui/react";

export default function Footer() {
  const bgGradient = useColorModeValue(
    "linear-gradient(145deg, rgba(248,250,252,0.95), rgba(255,255,255,0.95))",
    "linear-gradient(145deg, rgba(26,32,44,0.95), rgba(45,55,72,0.95))"
  );
  
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");
  const boxBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.05)");
  const innerBorderColor = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.700", "gray.300");
  
  return (
    <Box 
      as="footer" 
      bg={bgGradient}
      backdropFilter="blur(12px)"
      borderTop="1px solid"
      borderColor={borderColor}
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
            bg={boxBg}
            backdropFilter="blur(8px)"
            border="1px solid"
            borderColor={innerBorderColor}
            maxW="md"
            mx="auto"
          >
            <Text 
              color={textColor} 
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
