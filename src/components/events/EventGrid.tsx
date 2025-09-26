"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import EventCard from "./EventCard";
import { useState, useEffect } from "react";
import type { Event } from "@/types";

// More flexible type that can handle both Event interface and Prisma query results
type EventItem = Event | {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  ticketUrl?: string | null;
  buttonType: string;
  locationName?: string | null;
  city?: string | null;
  state?: string | null;
  startAt: Date;
  endAt?: Date | null;
  status: string;
  heroImageId?: string | null;
  heroImage?: any;
  [key: string]: any;
};

export default function EventGrid({ 
  items: initialItems, 
  showArchiveActions = false,
  isAdminView = false
}: { 
  items: EventItem[];
  showArchiveActions?: boolean;
  isAdminView?: boolean;
}) {
  const [items, setItems] = useState(initialItems);

  // Sync state when initialItems prop changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDelete = (deletedId: string) => {
    setItems(prev => prev.filter(item => item.id !== deletedId));
  };

  const handleStatusChange = (eventId: string, newStatus: string) => {
    setItems(prev => prev.map(item => 
      item.id === eventId ? { ...item, status: newStatus } : item
    ));
  };

  return (
    <Box>
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3 }} 
        gap={8}
        spacing={0}
      >
        {items.map(e => (
          <EventCard
            key={e.id}
            id={e.id}
            slug={e.slug}
            title={e.title}
            startAt={e.startAt}
            locationName={e.locationName}
            city={e.city}
            state={e.state}
            hero={e.heroImage}
            buttonType={e.buttonType as Event['buttonType']}
            ticketUrl={e.ticketUrl}
            status={e.status as Event['status']}
            onDelete={() => handleDelete(e.id)}
            onStatusChange={handleStatusChange}
            showArchiveActions={showArchiveActions}
            isAdminView={isAdminView}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
