import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;

    // Check if gallery exists and user owns the associated event
    const gallery = await prisma.gallery.findFirst({
      where: { 
        id,
        event: { ownerId: user.id }
      },
      include: { event: true }
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found or access denied" }, { status: 404 });
    }

    // Delete gallery (GalleryImage records will be deleted automatically due to CASCADE)
    await prisma.gallery.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
