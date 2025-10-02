"use client";

import { Box, IconButton } from "@chakra-ui/react";

export default function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      position="fixed"
      bottom={{ base: "20px", md: "30px" }}
      right={{ base: "20px", md: "30px" }}
      zIndex={1000}
    >
      <IconButton
        aria-label="Back to top"
        icon={
          <Box fontSize={{ base: "lg", md: "xl" }}>
            ↑
          </Box>
        }
        size={{ base: "md", md: "lg" }}
        bgGradient="linear(135deg, green.500, green.600)"
        color="white"
        borderRadius="full"
        shadow="lg"
        _hover={{
          bgGradient: "linear(135deg, green.600, green.700)",
          transform: "translateY(-2px)",
          shadow: "xl"
        }}
        _active={{
          transform: "translateY(0px)"
        }}
        transition="all 0.3s ease"
        onClick={scrollToTop}
        w={{ base: "50px", md: "60px" }}
        h={{ base: "50px", md: "60px" }}
      />
    </Box>
  );
}
