import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(4000).optional(),
  ticketUrl: z.string().url().optional(),
  buttonType: z.enum(["RSVP", "BUY_TICKETS"]).default("RSVP"),
  locationName: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startAt: z.string().min(1, "Start date is required"),  // Changed from datetime() to string
  endAt: z.string().optional(),
  timezone: z.string().default("America/Los_Angeles"),
  status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).default("DRAFT"),
  heroImageId: z.string().optional()
});

export const updateEventSchema = createEventSchema.partial();
