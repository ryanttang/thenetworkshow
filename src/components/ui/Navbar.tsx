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
          <Link as={NextLink} href="/" display="flex" alignItems="center" gap={2}>
            <Image 
              src="/thc-logo.png" 
              alt="THC Members Only Club" 
              height="60px" 
              width="auto"
            />
            <Box fontWeight="bold" fontSize="xl">
              THC Members Only Club
            </Box>
          </Link>
        </HStack>
        <HStack spacing={6}>
          <Link as={NextLink} href="/gallery">Gallery</Link>
          <Link as={NextLink} href="/faq">FAQ</Link>
          <Link href="https://thcmembersonlyclub.com/waiver/" isExternal>
            Waiver
          </Link>
          {session && (
            <Link as={NextLink} href="/dashboard">Dashboard</Link>
          )}
          {session ? (
            <Button size="sm" variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Link as={NextLink} href="/signin">Sign In</Link>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
