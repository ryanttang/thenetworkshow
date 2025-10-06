import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { SupabaseClient } from "@/lib/supabase";
import { uploadBufferToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const form = await req.formData();
  const file = form.get("file") as File | null;
  
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  // Use Supabase REST API for user lookup
  const supabase = new SupabaseClient(true);
  const uploader = await supabase.findUnique("User", { email: session.user.email }) as any;
  if (!uploader) return NextResponse.json({ error: "User not found" }, { status: 401 });

  const arrayBuf = await file.arrayBuffer();
  const inputBuf = Buffer.from(arrayBuf);

  // Generate a unique key for the document
  const fileExtension = file.name.split('.').pop() || '';
  const baseKey = `documents/${randomUUID()}.${fileExtension}`;
  
  // Upload the file to S3
  const fileUrl = await uploadBufferToS3(
    baseKey, 
    inputBuf, 
    file.type,
    "public, max-age=31536000, immutable"
  );

  return NextResponse.json({ 
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type
  });
}
