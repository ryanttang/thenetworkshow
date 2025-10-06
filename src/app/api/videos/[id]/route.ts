import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";
import { z } from "zod";

const updateVideoSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  caption: z.string().optional(),
  videoUrl: z.string().url("Valid video URL is required").optional(),
  videoType: z.enum(["UPLOADED", "EXTERNAL"]).optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().positive().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = new SupabaseClient(true);
    const video = await supabase.findUnique("RecentEventVideo", { id: params.id }) as any;

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateVideoSchema.parse(body);

    // Update video using Supabase REST API
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/RecentEventVideo?id=eq.${params.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(validatedData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Supabase Video update failed:", {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        errorText,
        validatedData
      });
      return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
    }

    const videoArray = await updateResponse.json();
    const video = videoArray[0]; // Supabase returns an array

    return NextResponse.json({ video });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // Delete video using Supabase REST API
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/RecentEventVideo?id=eq.${params.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error("Supabase Video deletion failed:", {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        errorText
      });
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
