"use client";
import { Box, Button, Heading, HStack, Stack, Text, Image as CImage } from "@chakra-ui/react";
import NextLink from "next/link";
import { format } from "date-fns";

type Props = {
  slug: string;
  title: string;
  startAt: string;
  locationName?: string | null;
  city?: string | null;
  state?: string | null;
  hero?: any | null; // image.variants
};

export default function EventCard({ slug, title, startAt, locationName, city, state, hero }: Props) {
  const variants = hero?.variants as any;
  const v = variants?.card ?? variants?.thumb ?? variants?.tiny;
  const img = v?.webpUrl ?? v?.jpgUrl;
  
  return (
    <Box 
      bg="white" 
      borderRadius="2xl" 
      overflow="hidden" 
      boxShadow="lg" 
      border="1px solid"
      borderColor="gray.100"
      _hover={{ 
        boxShadow: "xl", 
        transform: "translateY(-2px)",
        transition: "all 0.3s ease"
      }} 
      transition="all 0.3s ease"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {img && (
        <CImage
          src={img}
          alt={title}
          w="100%"
          h="220px"
          objectFit="cover"
          loading="lazy"
        />
      )}
      <Stack p={6} spacing={4} flex={1} display="flex" flexDirection="column">
        <Box flex={1}>
          <Heading 
            size="md" 
            noOfLines={2} 
            mb={3}
            color="gray.800"
            lineHeight="1.3"
          >
            {title}
          </Heading>
          <Text 
            color="gray.600" 
            fontSize="sm" 
            fontWeight="500"
            mb={2}
          >
            {format(new Date(startAt), "EEE, MMM d • p")}
          </Text>
          <Text 
            color="gray.600" 
            noOfLines={1}
            fontSize="sm"
          >
            {locationName ?? `${city ?? ""}${state ? `, ${state}` : ""}`}
          </Text>
        </Box>
        <HStack pt={2} justify="flex-end">
          <Button 
            as={NextLink} 
            href={`/events/${slug}`} 
            colorScheme="teal" 
            variant="solid" 
            size="md"
            px={6}
            _hover={{
              transform: "translateY(-1px)",
              shadow: "md"
            }}
            transition="all 0.2s"
          >
            View Details
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
