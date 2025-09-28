"use client";
import { 
  Box, 
  Flex, 
  HStack, 
  VStack,
  Link, 
  Image, 
  Button, 
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Text
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const bg = useColorModeValue("white", "gray.800");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const navLinks = [
    { label: "Gallery", href: "/gallery" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Waiver", href: "https://thcmembersonlyclub.com/waiver/", isExternal: true },
  ];

  if (session) {
    navLinks.push({ label: "Dashboard", href: "/dashboard" });
  }

  const NavLinks = () => (
    <>
      {navLinks.map((link) => (
        <Link 
          key={link.href}
          as={link.isExternal ? "a" : NextLink} 
          href={link.href}
          {...(link.isExternal && { isExternal: true })}
          _hover={{ textDecoration: "underline" }}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <>
        <Box as="header" bg={bg} boxShadow="sm" position="sticky" top={0} zIndex={10}>
          <Flex maxW="7xl" mx="auto" px={4} py={3} align="center" justify="space-between">
            <Link as={NextLink} href="/" display="flex" alignItems="center" gap={2}>
              <Image 
                src="/thc-logo.png" 
                alt="THC Members Only Club" 
                height="40px" 
                width="auto"
              />
              <Box fontWeight="bold" fontSize="md" display={{ base: "none", sm: "block" }}>
                THC Members Only Club
              </Box>
            </Link>
            
            <HStack spacing={2}>
              {session ? (
                <Button size="sm" variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button as={NextLink} href="/signin" size="sm" colorScheme="blue">
                  Sign In
                </Button>
              )}
              <IconButton
                ref={btnRef}
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                size="sm"
                variant="ghost"
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Box>

        <Drawer
          isOpen={isOpen}
          placement="right"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <Text color="blue.600" fontWeight="600">Menu</Text>
            </DrawerHeader>
            <DrawerBody py={6}>
              <VStack spacing={4} align="stretch">
                <NavLinks />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

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
          <NavLinks />
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
