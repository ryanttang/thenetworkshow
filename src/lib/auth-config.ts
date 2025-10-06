import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        console.log("Authorize called with:", { email: creds?.email, hasPassword: !!creds?.password });
        
        if (!creds?.email || !creds?.password) {
          console.log("Missing credentials");
          return null;
        }

        // Check if DATABASE_URL is available
        if (!process.env.DATABASE_URL) {
          console.error("DATABASE_URL not configured");
          return null;
        }
        
        // Check if we're in build mode
        const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
        if (isBuildTime) {
          console.log("Build time detected, skipping authentication");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({ 
            where: { email: creds.email.toLowerCase() }
          });
          
          console.log("User lookup result:", user ? { id: user.id, email: user.email, hasPassword: !!user.hashedPassword } : "not found");
          
          if (!user) {
            console.log("User not found:", creds.email);
            return null;
          }
          
          if (!user.hashedPassword) {
            console.log("User has no password:", creds.email);
            return null;
          }
          
          const isValidPassword = await compare(creds.password, user.hashedPassword);
          console.log("Password validation result:", isValidPassword);
          
          if (!isValidPassword) {
            console.log("Invalid password for user:", creds.email);
            return null;
          }
          
          console.log("User authenticated successfully:", user.email);
          return { 
            id: user.id, 
            email: user.email, 
            role: user.role, 
            name: user.name 
          };
        } catch (error) {
          console.error("Auth error:", error);
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
  debug: true, // Enable debug in production for troubleshooting
  // Add proper URL handling
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};
