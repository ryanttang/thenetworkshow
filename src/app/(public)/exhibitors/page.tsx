import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";

export const metadata = {
  title: "Exhibitors | The Network Show",
  description: "Information for exhibitors at The Network Show. Coming soon.",
};

export default function ExhibitorsPage() {
  return (
    <Container maxW="container.lg" py={{ base: 10, md: 16 }}>
      <VStack spacing={6} align="start">
        <Heading size="2xl">Exhibitors</Heading>
        <Text fontSize="lg" color="gray.600">
          We&apos;re preparing a comprehensive exhibitors hub with details on booths, setup,
          logistics, and sponsorship opportunities. Check back soon.
        </Text>
        <Box>
          <Button as={Link} href="/contact" colorScheme="blue">
            Contact us
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}


