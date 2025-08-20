"use client";
import { Box, Flex, HStack, Link, Image, Button, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box as="header" bg={bg} boxShadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex maxW="7xl" mx="auto" px={4} py={3} align="center" justify="space-between">
        <HStack spacing={3}>
          <Link as={NextLink} href="/" fontWeight="bold" fontSize="xl">
            Events Platform
          </Link>
        </HStack>
        <HStack spacing={6}>
          {session ? (
            <>
              <Link as={NextLink} href="/dashboard">Dashboard</Link>
              <Button size="sm" variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link as={NextLink} href="/signin">Sign In</Link>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
