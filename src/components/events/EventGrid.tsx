"use client";
import { SimpleGrid } from "@chakra-ui/react";
import EventCard from "./EventCard";

export default function EventGrid({ items }: { items: any[] }) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
      {items.map(e => (
        <EventCard
          key={e.id}
          slug={e.slug}
          title={e.title}
          startAt={e.startAt}
          locationName={e.locationName}
          city={e.city}
          state={e.state}
          hero={e.heroImage}
        />
      ))}
    </SimpleGrid>
  );
}
