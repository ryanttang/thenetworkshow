import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("error-report");

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
        ...((extra as Record<string, unknown>) || {}),
      }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to handle error report", error as Error);
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  }
}


