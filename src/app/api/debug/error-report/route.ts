import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("error-report");

// In-memory store for quick lookup by digest in dev/prod runtime
type ErrorReport = {
  message?: string;
  name?: string;
  stack?: string;
  digest?: string;
  pathname?: string;
  url?: string;
  timestamp?: string;
  componentStack?: string;
  userAgent?: string;
  referer?: string;
  xRequestId?: string;
  vercelId?: string;
  geoCity?: string;
  geoCountry?: string;
  geoRegion?: string;
  forwardedFor?: string;
  extra?: Record<string, unknown>;
};

const MAX_BUFFER = 200;
const recentErrors: ErrorReport[] = [];

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const digest = search.get("digest");

  if (digest) {
    const matches = recentErrors.filter(e => e.digest === digest);
    return NextResponse.json({ count: matches.length, matches }, { status: 200 });
  }

  // Return most recent N for quick inspection
  return NextResponse.json({ count: recentErrors.length, recent: recentErrors.slice(-50).reverse() }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      message,
      name,
      stack,
      digest,
      pathname,
      url,
      timestamp,
      componentStack,
      extra,
    } = body ?? {};

    const userAgent = request.headers.get("user-agent") || undefined;
    const referer = request.headers.get("referer") || undefined;
    const xRequestId = request.headers.get("x-request-id") || undefined;
    const vercelId = request.headers.get("x-vercel-id") || undefined;
    const geoCity = request.headers.get("x-vercel-ip-city") || undefined;
    const geoCountry = request.headers.get("x-vercel-ip-country") || undefined;
    const geoRegion = request.headers.get("x-vercel-ip-country-region") || undefined;
    const forwardedFor = request.headers.get("x-forwarded-for") || undefined;

    logger.error(
      "Client-side error reported",
      new Error(message || "Unknown client error"),
      {
        name,
        stack,
        digest,
        url: url || request.nextUrl?.href,
        pathname: pathname || request.nextUrl?.pathname,
        timestamp,
        componentStack,
        userAgent,
        referer,
        xRequestId,
        vercelId,
        geoCity,
        geoCountry,
        geoRegion,
        forwardedFor,
        ...((extra as Record<string, unknown>) || {}),
      }
    );

    // Buffer in memory for quick digest lookup
    const record: ErrorReport = {
      message,
      name,
      stack,
      digest,
      pathname: pathname || request.nextUrl?.pathname,
      url: url || request.nextUrl?.href,
      timestamp: timestamp || new Date().toISOString(),
      componentStack,
      userAgent,
      referer,
      xRequestId,
      vercelId,
      geoCity,
      geoCountry,
      geoRegion,
      forwardedFor,
      extra: (extra as Record<string, unknown>) || undefined,
    };
    recentErrors.push(record);
    if (recentErrors.length > MAX_BUFFER) {
      recentErrors.splice(0, recentErrors.length - MAX_BUFFER);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to handle error report", error as Error);
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  }
}


