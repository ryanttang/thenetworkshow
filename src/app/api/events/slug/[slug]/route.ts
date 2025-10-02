import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest, 
  { params }: { params: { slug: string }}
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Look up by slug (for public access, published events only)
    const event = await prisma.event.findUnique({
      where: { 
        slug: slug,
        status: "PUBLISHED"
      },
      include: { heroImage: true, images: true }
    });
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
