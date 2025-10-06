import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        console.log("=== NEXTAUTH AUTHORIZE DEBUG ===");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Vercel Env:", process.env.VERCEL_ENV);
        console.log("Credentials received:", { 
          email: creds?.email, 
          hasPassword: !!creds?.password,
          passwordLength: creds?.password?.length || 0
        });
        
        if (!creds?.email || !creds?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        // Check environment variables
        console.log("=== ENVIRONMENT CHECK ===");
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
        console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 50) + "...");
        console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
        console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

        if (!process.env.DATABASE_URL) {
          console.error("❌ DATABASE_URL not configured");
          return null;
        }

        if (!process.env.NEXTAUTH_SECRET) {
          console.error("❌ NEXTAUTH_SECRET not configured");
          return null;
        }
        
        // Skip authentication during build time
        if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
          console.log("⚠️ Preview build detected, skipping authentication");
          return null;
        }

        try {
          console.log("=== DATABASE CONNECTION TEST ===");
          console.log("Attempting to connect to database...");
          
          // Test basic connection first
          const userCount = await prisma.user.count();
          console.log("✅ Database connected! User count:", userCount);
          
          console.log("=== USER LOOKUP ===");
          console.log("Looking for user:", creds.email.toLowerCase());
          const user = await prisma.user.findUnique({ 
            where: { email: creds.email.toLowerCase() }
          });
          
          console.log("User lookup result:", user ? {
            id: user.id,
            email: user.email,
            hasPassword: !!user.hashedPassword,
            role: user.role,
            createdAt: user.createdAt
          } : "❌ User not found");
          
          if (!user) {
            console.log("❌ User not found:", creds.email);
            return null;
          }
          
          if (!user.hashedPassword) {
            console.log("❌ User has no password:", creds.email);
            return null;
          }
          
          console.log("=== PASSWORD VALIDATION ===");
          console.log("Comparing password...");
          const isValidPassword = await compare(creds.password, user.hashedPassword);
          console.log("Password validation result:", isValidPassword);
          
          if (!isValidPassword) {
            console.log("❌ Invalid password for user:", creds.email);
            return null;
          }
          
          console.log("✅ User authenticated successfully:", user.email);
          console.log("=== AUTH SUCCESS ===");
          return { 
            id: user.id, 
            email: user.email, 
            role: user.role, 
            name: user.name 
          };
        } catch (error) {
          console.error("=== DATABASE ERROR ===");
          console.error("Error type:", error?.constructor?.name);
          console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
          console.error("Error stack:", error instanceof Error ? error.stack : undefined);
          console.error("Full error object:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).role = token.role;
      (session as any).userId = token.userId;
      return session;
    }
  },
  pages: { 
    signIn: "/signin",
    error: "/api/auth/error"
  },
  debug: true // Enable debug in production for troubleshooting
};
