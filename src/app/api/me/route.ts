import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use Supabase REST API for user lookup
  const supabase = new SupabaseClient(true);
  const user = await supabase.findUnique("User", { email: session.user.email }) as any;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return only the required fields
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  });
}
