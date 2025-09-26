import { prisma } from "@/lib/prisma";

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || process.env.FACEBOOK_REDIRECT_URI;

if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET || !INSTAGRAM_REDIRECT_URI) {
  // Soft warn in dev only
  if (process.env.NODE_ENV !== "production") {
    console.warn("Instagram env vars are not fully configured.");
  }
}

export function getInstagramAuthUrl(state?: string) {
  const base = new URL("https://api.instagram.com/oauth/authorize");
  base.searchParams.set("client_id", INSTAGRAM_APP_ID || "");
  base.searchParams.set("redirect_uri", INSTAGRAM_REDIRECT_URI || "");
  base.searchParams.set("scope", "user_profile,user_media");
  base.searchParams.set("response_type", "code");
  if (state) base.searchParams.set("state", state);
  return base.toString();
}

export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID || "",
    client_secret: INSTAGRAM_APP_SECRET || "",
    grant_type: "authorization_code",
    redirect_uri: INSTAGRAM_REDIRECT_URI || "",
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Failed to exchange code for token");
  return res.json() as Promise<{ access_token: string; user_id: string }>;
}

export async function getLongLivedToken(shortLivedToken: string) {
  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", INSTAGRAM_APP_SECRET || "");
  url.searchParams.set("access_token", shortLivedToken);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to get long-lived token");
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export async function refreshLongLivedToken(longLivedToken: string) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", longLivedToken);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to refresh long-lived token");
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export async function fetchUserProfile(accessToken: string) {
  const url = new URL("https://graph.instagram.com/me");
  url.searchParams.set("fields", "id,username,account_type");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch IG user profile");
  return res.json() as Promise<{ id: string; username: string; account_type?: string }>;
}

export async function fetchUserMedia(accessToken: string, after?: string) {
  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("access_token", accessToken);
  if (after) url.searchParams.set("after", after);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch IG media");
  return res.json() as Promise<{ data: Array<any>; paging?: { cursors?: { after?: string } } }>;
}

export async function upsertInstagramAccount(params: {
  ownerUserId: string;
  igUserId: string;
  username: string;
  accountType?: string | null;
  accessToken: string;
  expiresInSeconds?: number | null;
}) {
  const expiresAt = params.expiresInSeconds
    ? new Date(Date.now() + params.expiresInSeconds * 1000)
    : null;

  const account = await prisma.instagramAccount.upsert({
    where: { igUserId: params.igUserId },
    create: {
      userId: params.ownerUserId,
      igUserId: params.igUserId,
      username: params.username,
      accountType: params.accountType || null,
      accessToken: params.accessToken,
      tokenExpiresAt: expiresAt,
    },
    update: {
      userId: params.ownerUserId,
      username: params.username,
      accountType: params.accountType || null,
      accessToken: params.accessToken,
      tokenExpiresAt: expiresAt,
    },
  });
  return account;
}

export async function upsertInstagramPosts(accountId: string, items: Array<any>) {
  for (const item of items) {
    const takenAt = item.timestamp ? new Date(item.timestamp) : null;
    await prisma.instagramPost.upsert({
      where: { igMediaId: item.id },
      create: {
        accountId,
        igMediaId: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url || null,
        permalink: item.permalink,
        caption: item.caption || null,
        takenAt,
      },
      update: {
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url || null,
        permalink: item.permalink,
        caption: item.caption || null,
        takenAt,
      },
    });
  }
}


