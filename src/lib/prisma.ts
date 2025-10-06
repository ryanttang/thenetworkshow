import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new Prisma client instance for each request in production
// to avoid prepared statement conflicts with connection pooling
const createPrismaClient = () => {
  // Check if we're in build mode (no DATABASE_URL available)
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
  
  if (isBuildTime) {
    // Return a mock client for build time
    return {
      user: { count: () => Promise.resolve(0) },
      $executeRaw: () => Promise.resolve(),
      $disconnect: () => Promise.resolve(),
    } as any;
  }
  
  // In production, use service role key to bypass RLS
  let databaseUrl = process.env.DATABASE_URL;
  
  if (process.env.NODE_ENV === 'production' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // For Supabase, construct the direct database URL with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      // Extract project reference from Supabase URL
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      if (projectRef) {
        // Use direct database connection (not pooler) with service role key
        databaseUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;
      }
    }
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// Always create a new client to avoid prepared statement conflicts
export const prisma = createPrismaClient();

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