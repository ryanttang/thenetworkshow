import { Role, Event } from "@prisma/client";

export const isAdmin = (role?: Role | null) => role === "ADMIN";

export const canEditEvent = (event: Event, userId?: string | null, role?: Role | null) => {
  if (!userId) return false;
  if (isAdmin(role) || role === "ORGANIZER") return true;
  return event.ownerId === userId;
};
