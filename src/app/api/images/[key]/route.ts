import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Check if we're in build mode
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

const s3Client = isBuildTime ? null : new S3Client({
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
    // Return error during build time
    if (isBuildTime) {
      return NextResponse.json({ error: "Service unavailable during build" }, { status: 503 });
    }
    
    const { key } = params;
    
    if (!key) {
      console.error("Image API: Missing key parameter");
      return NextResponse.json({ error: "Image key is required" }, { status: 400 });
    }

    // Decode the URL-encoded key
    const decodedKey = decodeURIComponent(key);
    console.log("Image API: Serving image with key:", decodedKey);
    
    // Check if required environment variables are set
    if (!process.env.S3_BUCKET) {
      console.error("Image API: S3_BUCKET environment variable not set");
      return NextResponse.json({ error: "S3 configuration error" }, { status: 500 });
    }
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Image API: AWS credentials not configured");
      return NextResponse.json({ error: "AWS configuration error" }, { status: 500 });
    }

    // Create a presigned URL for the S3 object
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: decodedKey,
    });

    console.log("Image API: Creating presigned URL for bucket:", process.env.S3_BUCKET);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    console.log("Image API: Generated presigned URL successfully");

    // Redirect to the presigned URL
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Image API: Error serving image:", error);
    
    // Return a more detailed error response
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Failed to serve image", 
          details: error.message,
          key: params?.key 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to serve image", key: params?.key },
      { status: 500 }
    );
  }
}
