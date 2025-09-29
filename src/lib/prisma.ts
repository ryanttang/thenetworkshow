import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new Prisma client instance for each request in production
// to avoid prepared statement conflicts with connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma = process.env.NODE_ENV === 'production' 
  ? createPrismaClient()
  : (globalForPrisma.prisma || createPrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to set user context for RLS
export async function setUserContext(userId: string | null) {
  try {
    if (userId) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    } else {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', true)`;
    }
  } catch (error) {
    // Log error but don't throw to avoid breaking the application
    console.error('Failed to set user context:', error);
  }
}
