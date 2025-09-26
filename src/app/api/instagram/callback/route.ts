import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { exchangeCodeForToken, getLongLivedToken, fetchUserProfile, upsertInstagramAccount } from "@/lib/instagram";

export async function GET(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect("/dashboard?instagram=error");
  }
  if (!code) {
    return NextResponse.redirect("/dashboard?instagram=missing_code");
  }

  try {
    const tokenResp = await exchangeCodeForToken(code);
    const ll = await getLongLivedToken(tokenResp.access_token);
    const profile = await fetchUserProfile(ll.access_token);

    await upsertInstagramAccount({
      ownerUserId: session.user.id as string,
      igUserId: profile.id,
      username: profile.username,
      accountType: profile.account_type ?? null,
      accessToken: ll.access_token,
      expiresInSeconds: ll.expires_in,
    });

    return NextResponse.redirect("/dashboard?instagram=connected");
  } catch (e) {
    console.error("Instagram callback error", e);
    return NextResponse.redirect("/dashboard?instagram=failed");
  }
}


