import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function uploadBufferToS3(
  Key: string,
  Body: Buffer,
  ContentType: string,
  CacheControl = "public, max-age=31536000, immutable"
) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key,
    Body,
    ContentType,
    CacheControl
    // ACL removed - bucket should have public read policy instead
  }));
  const base = process.env.S3_PUBLIC_BASE_URL!;
  return `${base}/${Key}`;
}

export async function uploadFile(file: File, keyPrefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${keyPrefix}${Date.now()}-${file.name}`;
  const contentType = file.type;
  
  return uploadBufferToS3(key, buffer, contentType);
}
