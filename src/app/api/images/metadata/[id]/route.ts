import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("Image Metadata API: Fetching image with ID:", id);
    
    if (!id) {
      console.error("Image Metadata API: No ID provided");
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Use Supabase REST API to fetch image metadata
    const supabase = new SupabaseClient(true);
    console.log("Image Metadata API: Querying Supabase for image:", id);
    const image = await supabase.findUnique("Image", { id }) as any;
    console.log("Image Metadata API: Supabase response:", image);

    if (!image) {
      console.error("Image Metadata API: Image not found in database:", id);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    console.log("Image Metadata API: Returning image data:", {
      id: image.id,
      hasVariants: !!image.variants,
      variantKeys: image.variants ? Object.keys(image.variants) : []
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Image Metadata API: Error fetching image by ID:", error);
    
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
