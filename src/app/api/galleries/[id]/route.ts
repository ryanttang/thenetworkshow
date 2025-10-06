import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = new SupabaseClient(true);
    const user = await supabase.findUnique("User", { email: session.user.email }) as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;

    // Check if gallery exists and user has access to it
    const gallery = await supabase.findUnique("Gallery", { 
      id,
      OR: [
        { "event.ownerId": user.id }, // User owns the associated event
        { eventId: null } // Or it's a standalone gallery (anyone can delete)
      ]
    }) as any;

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found or access denied" }, { status: 404 });
    }

    // Delete gallery using Supabase REST API (GalleryImage records will be deleted automatically due to CASCADE)
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Gallery?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error("Supabase Gallery deletion failed:", {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        errorText
      });
      return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
