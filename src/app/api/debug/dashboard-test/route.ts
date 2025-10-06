import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { getRequestMeta } from "@/lib/request";

const logger = createLogger("dashboard-test");

export async function GET(request: NextRequest) {
  const reqMeta = getRequestMeta();
  
  try {
    logger.info("Starting dashboard test", { ...reqMeta });
    
    // Test 1: Environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };
    
    logger.info("Environment check", { ...reqMeta, envCheck });
    
    // Test 2: Session
    let session;
    try {
      session = await getServerAuthSession();
      logger.info("Session test completed", { ...reqMeta, hasSession: !!session, userEmail: session?.user?.email });
    } catch (error) {
      logger.error("Session test failed", error as Error, { ...reqMeta });
      return NextResponse.json({ 
        error: "Session test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        envCheck 
      }, { status: 500 });
    }
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        message: "No session - this is expected for unauthenticated requests",
        envCheck 
      });
    }
    
    // Test 3: Supabase client
    let supabase;
    try {
      supabase = new SupabaseClient(true);
      logger.info("Supabase client test completed", { ...reqMeta });
    } catch (error) {
      logger.error("Supabase client test failed", error as Error, { ...reqMeta });
      return NextResponse.json({ 
        error: "Supabase client test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        envCheck 
      }, { status: 500 });
    }
    
    // Test 4: User lookup
    let user;
    try {
      user = await supabase.findUnique("User", { email: session.user.email }) as any;
      logger.info("User lookup test completed", { ...reqMeta, userFound: !!user, emailTried: session.user.email });
    } catch (error) {
      logger.error("User lookup test failed", error as Error, { ...reqMeta, emailTried: session.user.email });
      return NextResponse.json({ 
        error: "User lookup test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        envCheck 
      }, { status: 500 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found", 
        emailTried: session.user.email,
        envCheck 
      }, { status: 404 });
    }
    
    // Test 5: Events query
    let events;
    try {
      const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";
      const eventsWhere = canManageAllEvents ? { status: "PUBLISHED" } : { status: "PUBLISHED", ownerId: user.id };
      
      events = await supabase.findMany("Event", {
        where: eventsWhere,
        orderBy: { startAt: "desc" }
      }) as any[];
      
      logger.info("Events query test completed", { ...reqMeta, count: events.length, whereClause: eventsWhere });
    } catch (error) {
      logger.error("Events query test failed", error as Error, { ...reqMeta, userId: user.id });
      return NextResponse.json({ 
        error: "Events query test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        envCheck 
      }, { status: 500 });
    }
    
    // Test 6: Coordinations query
    let coordinations;
    try {
      const canManageAllEvents = user.role === "ADMIN" || user.role === "ORGANIZER";
      const coordinationsWhere = canManageAllEvents 
        ? {}
        : { eventId: { in: (events || []).map((e: any) => e.id).filter(Boolean) } };
      
      coordinations = await supabase.findMany("Coordination", {
        where: coordinationsWhere,
        orderBy: { createdAt: "desc" }
      }) as any[];
      
      logger.info("Coordinations query test completed", { ...reqMeta, count: coordinations.length, whereClause: coordinationsWhere });
    } catch (error) {
      logger.error("Coordinations query test failed", error as Error, { ...reqMeta, userId: user.id });
      return NextResponse.json({ 
        error: "Coordinations query test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        envCheck 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      events: {
        count: events.length,
        sample: events.slice(0, 2).map((e: any) => ({ id: e.id, title: e.title, status: e.status }))
      },
      coordinations: {
        count: coordinations.length,
        sample: coordinations.slice(0, 2).map((c: any) => ({ id: c.id, eventId: c.eventId, createdAt: c.createdAt }))
      },
      envCheck
    });
    
  } catch (error) {
    logger.error("Dashboard test failed", error as Error, { ...reqMeta });
    return NextResponse.json({ 
      error: "Dashboard test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
