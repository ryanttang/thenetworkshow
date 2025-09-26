import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getInstagramAuthUrl } from "@/lib/instagram";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    // Redirect to sign-in page instead of returning JSON error
    return NextResponse.redirect(new URL("/signin", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  const url = getInstagramAuthUrl();
  return NextResponse.redirect(url);
}


