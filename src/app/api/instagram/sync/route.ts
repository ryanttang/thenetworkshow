import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma, setUserContext } from "@/lib/prisma";
import { fetchUserMedia, upsertInstagramPosts } from "@/lib/instagram";

export async function POST() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user ID from email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Set user context for RLS policies
  await setUserContext(user.id);

  const account = await prisma.instagramAccount.findFirst({ where: { userId: user.id } });
  if (!account) return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });

  const collected: any[] = [];
  let after: string | undefined;
  do {
    const page = await fetchUserMedia(account.accessToken, after);
    collected.push(...page.data);
    after = page.paging?.cursors?.after;
  } while (after);

  await upsertInstagramPosts(account.id, collected, user.id);

  return NextResponse.json({ ok: true, imported: collected.length });
}


