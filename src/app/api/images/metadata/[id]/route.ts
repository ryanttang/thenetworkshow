import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Use Supabase REST API to fetch image metadata
    const supabase = new SupabaseClient(true);
    const image = await supabase.findUnique("Image", { id }) as any;

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Image API: Error fetching image by ID:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Failed to fetch image", 
          details: error.message,
          id: params?.id 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch image", id: params?.id },
      { status: 500 }
    );
  }
}
