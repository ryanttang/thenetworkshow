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
    <Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="sm" _hover={{ boxShadow: "md" }} transition="all 0.2s">
      {img && (
        <CImage
          src={img}
          alt={title}
          w="100%"
          h="200px"
          objectFit="cover"
          loading="lazy"
        />
      )}
      <Stack p={4} spacing={2}>
        <Heading size="md" noOfLines={2}>{title}</Heading>
        <Text color="gray.600">{format(new Date(startAt), "EEE, MMM d • p")}</Text>
        <Text color="gray.600" noOfLines={1}>
          {locationName ?? `${city ?? ""}${state ? `, ${state}` : ""}`}
        </Text>
        <HStack pt={2} justify="space-between">
          <Button as={NextLink} href={`/events/${slug}`} colorScheme="teal" variant="solid" size="sm">
            View Details
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
