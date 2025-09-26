import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadBufferToS3 } from "@/lib/s3";
import { VARIANTS, makeVariant, normalizeBuffer } from "@/lib/images";
import { randomUUID } from "crypto";
import type { ImageVariants } from "@/types";

export const runtime = "nodejs"; // ensure sharp works

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const eventId = form.get("eventId") as string | null;
    
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    // MIME type validation
    const allowed = ["image/jpeg","image/png","image/webp","image/avif","image/heic","image/heif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const uploader = await prisma.user.findUnique({ where: { email: session.user.email }});
    if (!uploader) return NextResponse.json({ error: "User not found" }, { status: 401 });

    // Check AWS configuration
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET) {
      console.error("AWS configuration missing:", {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.S3_BUCKET
      });
      return NextResponse.json({ error: "AWS configuration missing" }, { status: 500 });
    }

    const arrayBuf = await file.arrayBuffer();
    const inputBuf = Buffer.from(arrayBuf);
    const baseBuf = await normalizeBuffer(inputBuf);

    const baseKey = `events/${eventId ?? "unassigned"}/${randomUUID()}`;
    const variants: Partial<ImageVariants> = {};

    for (const v of VARIANTS) {
      const out = await makeVariant(baseBuf, v.width);
      const webpKey = `${baseKey}_${v.name}.webp`;
      const jpgKey  = `${baseKey}_${v.name}.jpg`;
      const webpUrl = await uploadBufferToS3(webpKey, out.webp, "image/webp");
      const jpgUrl  = await uploadBufferToS3(jpgKey, out.jpeg, "image/jpeg");
      variants[v.name] = { width: out.width, height: out.height, webpKey, jpgKey, webpUrl, jpgUrl };
    }

    // Original (capped to 2400w)
    const hero = await makeVariant(baseBuf, 2400);
    const origWebpKey = `${baseKey}_orig.webp`;
    const origJpgKey  = `${baseKey}_orig.jpg`;
    const origWebpUrl = await uploadBufferToS3(origWebpKey, hero.webp, "image/webp");
    const origJpgUrl  = await uploadBufferToS3(origJpgKey, hero.jpeg, "image/jpeg");

    const image = await prisma.image.create({
      data: {
        eventId: eventId ?? null,
        uploaderId: uploader.id,
        originalKey: origWebpKey,
        format: "webp",
        width: hero.width,
        height: hero.height,
        variants: {
          tiny: variants.tiny!,
          thumb: variants.thumb!,
          card: variants.card!,
          hero: variants.hero!,
          original: { webpKey: origWebpKey, jpgKey: origJpgKey, webpUrl: origWebpUrl, jpgUrl: origJpgUrl, width: hero.width, height: hero.height }
        } as any // Type assertion for Prisma JSON field
      }
    });

    return NextResponse.json({ imageId: image.id, variants: image.variants });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
