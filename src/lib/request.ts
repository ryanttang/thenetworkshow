import { headers } from "next/headers";

export function getRequestId(): string {
  const h = headers();
  const existing = h.get("x-request-id");
  if (existing && existing.trim().length > 0) return existing;
  // Fallback server-generated ID
  // crypto.randomUUID is available in the Edge/Node runtimes used by Next.js
  try {
    // @ts-ignore
    return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function getRequestMeta() {
  const h = headers();
  return {
    requestId: getRequestId(),
    userAgent: h.get("user-agent") || undefined,
    referer: h.get("referer") || undefined,
    forwardedFor: h.get("x-forwarded-for") || undefined,
    host: h.get("host") || undefined,
    protocol: h.get("x-forwarded-proto") || undefined,
  };
}


