export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest, 
  { params }: { params: { slug: string }}
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Use Supabase REST API to fetch event by slug
    const supabase = new SupabaseClient(true);
    const event = await supabase.findUnique("Event", { 
      slug,
      status: "PUBLISHED"
    }) as any;
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
