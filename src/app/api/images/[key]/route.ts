import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    
    if (!key) {
      return NextResponse.json({ error: "Image key is required" }, { status: 400 });
    }

    // Decode the URL-encoded key
    const decodedKey = decodeURIComponent(key);
    
    // Create a presigned URL for the S3 object
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: decodedKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Redirect to the presigned URL
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
