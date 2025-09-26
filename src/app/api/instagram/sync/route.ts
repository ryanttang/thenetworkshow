import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma, setUserContext } from "@/lib/prisma";
import { fetchUserMedia, upsertInstagramPosts } from "@/lib/instagram";

export async function POST() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Set user context for RLS policies
  await setUserContext(session.user.id as string);

  const account = await prisma.instagramAccount.findFirst({ where: { userId: session.user.id as string } });
  if (!account) return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });

  const collected: any[] = [];
  let after: string | undefined;
  do {
    const page = await fetchUserMedia(account.accessToken, after);
    collected.push(...page.data);
    after = page.paging?.cursors?.after;
  } while (after);

  await upsertInstagramPosts(account.id, collected, session.user.id as string);

  return NextResponse.json({ ok: true, imported: collected.length });
}


