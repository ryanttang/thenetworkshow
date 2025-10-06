import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { getRequestMeta } from "@/lib/request";

const logger = createLogger("supabase-test");

export async function GET(request: NextRequest) {
  const reqMeta = getRequestMeta();
  
  try {
    logger.info("Testing Supabase connection", { ...reqMeta });
    
    // Test 1: Initialize Supabase client
    let supabase;
    try {
      supabase = new SupabaseClient(true);
      logger.info("Supabase client initialized", { ...reqMeta });
    } catch (error) {
      logger.error("Supabase client initialization failed", error as Error, { ...reqMeta });
      return NextResponse.json({ 
        error: "Supabase client initialization failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, { status: 500 });
    }
    
    // Test 2: Test user lookup
    let user;
    try {
      user = await supabase.findUnique("User", { email: "network_admin@example.com" }) as any;
      logger.info("User lookup test completed", { ...reqMeta, userFound: !!user });
    } catch (error) {
      logger.error("User lookup test failed", error as Error, { ...reqMeta });
      return NextResponse.json({ 
        error: "User lookup test failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, { status: 500 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found", 
        emailTried: "network_admin@example.com" 
      }, { status: 404 });
    }
    
    // Test 3: Test events query
    let events;
    try {
      events = await supabase.findMany("Event", {
        where: { status: "PUBLISHED" },
        orderBy: { startAt: "desc" }
      }) as any[];
      
      logger.info("Events query test completed", { ...reqMeta, count: events.length });
    } catch (error) {
      logger.error("Events query test failed", error as Error, { ...reqMeta });
      return NextResponse.json({ 
        error: "Events query test failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.hashedPassword
      },
      events: {
        count: events.length,
        sample: events.slice(0, 2).map((e: any) => ({ id: e.id, title: e.title, status: e.status }))
      }
    });
    
  } catch (error) {
    logger.error("Supabase test failed", error as Error, { ...reqMeta });
    return NextResponse.json({ 
      error: "Supabase test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
