import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";
import { z } from "zod";
import { supabaseRequest } from "@/lib/supabase-server";

const createVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().optional(),
  videoUrl: z.string().url("Valid video URL is required"),
  videoType: z.enum(["UPLOADED", "EXTERNAL"]).default("UPLOADED"),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().positive().optional(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
  autoplay: z.boolean().default(true),
  loop: z.boolean().default(true),
  muted: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublished = searchParams.get("published") !== "false";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  try {
    const supabase = new SupabaseClient(true);
    
    const whereClause = isPublished ? { isPublished: true } : {};
    const videos = await supabase.findMany("RecentEventVideo", {
      where: whereClause,
      orderBy: { sortOrder: "asc", createdAt: "desc" },
      select: "*"
    }) as any[];

    // Apply limit manually since Supabase REST API doesn't have built-in limit
    const limitedVideos = videos.slice(0, limit);

    return NextResponse.json({ videos: limitedVideos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = new SupabaseClient(true);
  const user = await supabase.findUnique("User", { email: session.user.email }) as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("Received video data:", body);
    
    const validatedData = createVideoSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Create video using Supabase REST API
    const videoResponse = await supabaseRequest('RecentEventVideo', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(validatedData)
    }, true); // Use service role

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error("Supabase Video creation failed:", {
        status: videoResponse.status,
        statusText: videoResponse.statusText,
        errorText,
        validatedData
      });
      return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
    }

    const videoArray = await videoResponse.json();
    const video = videoArray[0]; // Supabase returns an array

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error.errors);
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
