"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import EventCard from "./EventCard";
import { useState } from "react";

export default function EventGrid({ 
  items: initialItems, 
  showArchiveActions = false,
  isAdminView = false
}: { 
  items: any[];
  showArchiveActions?: boolean;
  isAdminView?: boolean;
}) {
  const [items, setItems] = useState(initialItems);

  const handleDelete = (deletedId: string) => {
    setItems(prev => prev.filter(item => item.id !== deletedId));
  };

  const handleStatusChange = (eventId: string, newStatus: string) => {
    setItems(prev => prev.filter(item => item.id !== deletedId));
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
            buttonType={e.buttonType}
            ticketUrl={e.ticketUrl}
            status={e.status}
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
