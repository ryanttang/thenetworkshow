import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configure for Supabase pooler
  ...(process.env.DATABASE_URL?.includes('pooler.supabase.com') && {
    log: ['error'],
  }),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to set user context for RLS
export async function setUserContext(userId: string | null) {
  if (userId) {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
  } else {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', true)`;
  }
}
