"use client";

import {
  Box,
  HStack,
  Link,
  Text,
  Button,
  useBreakpointValue,
  Container,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Events", href: "/dashboard/events", icon: "📅" },
  { label: "Archive", href: "/dashboard/events/archive", icon: "📦" },
  { label: "Gallery", href: "/dashboard/gallery", icon: "🖼️" },
  { label: "Coordination", href: "/dashboard/coordination", icon: "📋" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      w="100%"
      py={8}
      position="sticky"
      top={0}
      zIndex={10}
      shadow="md"
    >
      <Container maxW="7xl" px={{ base: 6, md: 8 }}>
        <HStack justify="space-between" align="center" spacing={8}>
          {/* Logo/Title */}
          <Text 
            fontSize="2xl" 
            fontWeight="800" 
            color="blue.600"
            letterSpacing="tight"
          >
            Admin Panel
          </Text>

          {/* Navigation Buttons */}
          <HStack spacing={4}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Button
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  size={buttonSize}
                  variant={isActive ? "solid" : "outline"}
                  colorScheme={isActive ? "blue" : "gray"}
                  leftIcon={<Text fontSize="sm">{item.icon}</Text>}
                  px={8}
                  py={3}
                  fontWeight="600"
                  _hover={{
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  _active={{
                    transform: "translateY(0px)",
                  }}
                  transition="all 0.2s ease"
                >
                  {item.label}
                </Button>
              );
            })}
            
            {/* Preview Homepage Button */}
            <Tooltip label="Preview Homepage" placement="bottom">
              <IconButton
                as={NextLink}
                href="/"
                aria-label="Preview homepage from user view"
                icon={<ViewIcon />}
                size={buttonSize}
                variant="ghost"
                colorScheme="blue"
                _hover={{
                  transform: "translateY(-1px)",
                  shadow: "lg",
                  bg: "blue.50",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.2s ease"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
