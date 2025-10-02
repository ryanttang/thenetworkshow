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
  const { data: session, status } = useSession();
  const bg = useColorModeValue("white", "gray.800");
  const btnRef = useRef<HTMLButtonElement>(null);
  
  // Define all color mode values at top level
  const headerBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 32, 0.95)");
  const headerBorderColor = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");
  const headerBorderColorMobile = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");
  const linkColor = useColorModeValue("gray.700", "gray.300");
  const linkHoverColor = useColorModeValue("blue.600", "blue.400");
  const drawerBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 32, 0.95)");
  const drawerBorderColor = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");
  const drawerTextColor = useColorModeValue("gray.700", "gray.300");
  const drawerCloseColor = useColorModeValue("gray.600", "gray.400");
  const drawerCloseHoverBg = useColorModeValue("rgba(100, 100, 100, 0.1)", "rgba(255, 255, 255, 0.1)");
  
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Waiver", href: "https://thcmembersonlyclub.com/waiver/", isExternal: true },
  ];

  // Only add Dashboard link after hydration to avoid mismatch
  if (isHydrated && session) {
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
          fontSize="md"
          fontWeight="600"
          color={linkColor}
          _hover={{ 
            color: linkHoverColor,
            transform: "translateY(-1px)",
            textDecoration: "none",
            _after: {
              width: '100%'
            }
          }}
          transition="all 0.2s ease-in-out"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            width: '0',
            height: '2px',
            bottom: '-4px',
            left: '50%',
            backgroundColor: 'blue.500',
            transition: 'all 0.3s ease-in-out',
            transform: 'translateX(-50%)'
          }}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  if (isMobile) {
    return (
      <>
        <Box 
          as="header" 
          bg={headerBg}
          backdropFilter="blur(12px)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
          borderBottom="1px solid"
          borderColor={headerBorderColorMobile}
          position="sticky" 
          top={0} 
          zIndex={10}
          transition="all 0.3s ease-in-out"
        >
          <Flex maxW="7xl" mx="auto" px={4} py={3} align="center" justify="space-between">
            <Link 
              as={NextLink} 
              href="/" 
              display="flex" 
              alignItems="center" 
              gap={3}
              _hover={{
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out"
              }}
            >
              <Box 
                p={1}
              >
                <Image 
                  src="/thc-logo.png" 
                  alt="THC Members Only Club" 
                  height="36px" 
                  width="auto"
                  filter="brightness(1.1)"
                />
              </Box>
              <Box 
                fontWeight="bold" 
                fontSize="md" 
                display={{ base: "none", sm: "block" }} 
                className="gradient-text"
                fontFamily="'SUSE Mono', monospace"
              >
                THC Members Only Club
              </Box>
            </Link>
            
            <IconButton
              ref={btnRef}
              aria-label="Open menu"
              size="md"
              bg="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              color="white"
              shadow="md"
              fontWeight="600"
              onClick={() => setIsOpen(true)}
              _hover={{
                bg: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                transform: "scale(1.1)",
                shadow: "lg"
              }}
              transition="all 0.3s ease-in-out"
            >
              <Image
                src="/weedicon.svg"
                alt="Menu icon"
                width={16}
                height={16}
              />
            </IconButton>
          </Flex>
        </Box>

        <Drawer
          isOpen={isOpen}
          placement="right"
          onClose={() => setIsOpen(false)}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
          <DrawerContent 
            bg={drawerBg}
            justifyContent="flex-start"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={drawerBorderColor}
          >
            <DrawerCloseButton 
              size="lg" 
              color={drawerCloseColor}
              _hover={{
                bg: drawerCloseHoverBg,
                transform: "scale(1.1)"
              }}
            />
            <DrawerHeader 
              borderBottomWidth="1px"
              borderColor={drawerBorderColor}
              pb={8}
              pt={8}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                <Image 
                  src="/thc-logo.png" 
                  alt="THC Members Only Club" 
                  height="36px" 
                  width="auto"
                  filter="brightness(0.8)"
                />
                <VStack spacing={2} align="center">
                  <Text fontSize="sm" color={drawerTextColor} fontWeight="600">
                    THC Members Only Club
                  </Text>
                  <Text fontSize="xs" color={drawerTextColor} fontStyle="italic" opacity={0.8}>
                    Premiere Cannabis Events
                  </Text>
                  <Button
                    as="a"
                    href="https://instagram.com/thcmembersonlyclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    color={drawerTextColor}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                    p={0}
                    w="24px"
                    h="24px"
                    minW="24px"
                    minH="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mt={1}
                  >
                    <Image
                      src="/Instagram_icon.png"
                      alt="Instagram"
                      width={12}
                      height={12}
                      objectFit="contain"
                    />
                  </Button>
                </VStack>
              </Box>
            </DrawerHeader>
            <DrawerBody pt={8}>
              <VStack spacing={8} align="stretch">
                {/* Navigation Links */}
                <VStack spacing={4} align="stretch">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href}
                        as={link.isExternal ? "a" : NextLink} 
                        href={link.href}
                        {...(link.isExternal && { 
                          target: "_blank", 
                          rel: "noopener noreferrer" 
                        })}
                        fontSize="lg"
                        fontWeight="600"
                        color={drawerTextColor}
                        textAlign="center"
                        py={3}
                        px={6}
                        borderRadius="lg"
                        _hover={{ 
                          color: linkHoverColor,
                          bg: "rgba(255, 255, 255, 0.1)",
                          transform: "translateY(-1px)",
                          textDecoration: "none",
                        }}
                        transition="all 0.3s ease-in-out"
                        width="full"
                        fontSize="md"
                        fontWeight="500"
                      >
                        {link.label}
                      </Link>
                    ))}
                </VStack>

                {/* Sign Out Button */}
                <VStack spacing={4} pt={4} borderTop="1px" borderColor={drawerBorderColor}>
                  {session ? (
                    <Button 
                      size="lg" 
                      onClick={() => signOut()}
                      bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                      color="white"
                      shadow="md"
                      fontWeight="600"
                      width="full"
                      py={6}
                      fontSize="md"
                      _hover={{
                        bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                        transform: "translateY(-1px) scale(1.02)",
                        shadow: "lg"
                      }}
                      transition="all 0.3s ease-in-out"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button 
                      as={NextLink} 
                      href="/signin" 
                      size="lg" 
                      bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                      color="white"
                      shadow="lg"
                      fontWeight="600"
                      width="full"
                      py={6}
                      fontSize="md"
                      _hover={{
                        bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                        transform: "translateY(-1px) scale(1.02)",
                        shadow: "xl"
                      }}
                      transition="all 0.3s ease-in-out"
                    >
                      Sign In
                    </Button>
                  )}
                  <Text 
                    fontSize="xs" 
                    color="gray.500" 
                    textAlign="center" 
                    fontStyle="italic"
                  >
                    Staff Use Only
                  </Text>
                </VStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box 
      as="header" 
      bg={headerBg} 
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={headerBorderColor}
      position="sticky" 
      top={0} 
      zIndex={10}
      transition="all 0.3s ease-in-out"
      _hover={{
        shadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(16px)"
      }}
    >
      <Flex maxW="7xl" mx="auto" px={6} py={4} align="center" justify="space-between">
        <HStack spacing={4}>
          <Link 
            as={NextLink} 
            href="/" 
            display="flex" 
            alignItems="center" 
            gap={3}
            _hover={{
              transform: "scale(1.02)",
              transition: "all 0.2s ease-in-out"
            }}
          >
            <Box 
              p={1}
            >
              <Image 
                src="/thc-logo.png" 
                alt="THC Members Only Club" 
                height="56px" 
                width="auto"
                filter="brightness(1.1)"
              />
            </Box>
            <Box 
              fontWeight="bold" 
              fontSize="xl" 
              className="gradient-text"
              fontFamily="'SUSE Mono', monospace"
            >
              THC Members Only Club
            </Box>
          </Link>
        </HStack>
        <HStack spacing={6}>
          <NavLinks />
          {session ? (
            <Button 
              size="md" 
              onClick={() => signOut()}
              bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              color="white"
              shadow="md"
              fontWeight="600"
              _hover={{
                bg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                transform: "translateY(-2px) scale(1.05)",
                shadow: "xl"
              }}
              transition="all 0.3s ease-in-out"
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              as={NextLink} 
              href="/signin"
              size="md"
              px={8}
              bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              color="white"
              shadow="lg"
              fontWeight="600"
              _hover={{
                bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                transform: "translateY(-2px)",
                shadow: "xl"
              }}
              transition="all 0.3s ease-in-out"
            >
              Sign In
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
