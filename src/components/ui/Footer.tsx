import { Box, Container, Text, VStack } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box as="footer" bg="gray.100" py={8} mt={16}>
      <Container maxW="7xl">
        <VStack spacing={4}>
          <Text color="gray.600" textAlign="center">
            © 2024 Events Platform. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
