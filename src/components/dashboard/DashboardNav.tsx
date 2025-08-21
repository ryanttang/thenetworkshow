"use client";

import {
  Box,
  HStack,
  Link,
  Text,
  VStack,
  Divider,
} from "@chakra-ui/react";
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
  { label: "Gallery", href: "/dashboard/gallery", icon: "🖼️" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <Box
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      w="250px"
      minH="100vh"
      py={6}
      position="fixed"
      left={0}
      top={0}
    >
      <VStack spacing={6} align="stretch">
        {/* Logo/Title */}
        <Box px={6}>
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Admin Panel
          </Text>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <VStack spacing={2} align="stretch" px={4}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                as={NextLink}
                href={item.href}
                display="flex"
                alignItems="center"
                px={4}
                py={3}
                borderRadius="md"
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.700" : "gray.700"}
                fontWeight={isActive ? "semibold" : "medium"}
                _hover={{
                  bg: isActive ? "blue.50" : "gray.50",
                  textDecoration: "none",
                }}
                transition="all 0.2s"
              >
                <Text fontSize="lg" mr={3}>{item.icon}</Text>
                {item.label}
              </Link>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
}
