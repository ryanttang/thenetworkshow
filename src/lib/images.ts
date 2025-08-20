import sharp from "sharp";

export const VARIANTS = [
  { name: "tiny",  width: 300 },
  { name: "thumb", width: 600 },
  { name: "card",  width: 1200 },
  { name: "hero",  width: 2000 }
] as const;

export async function normalizeBuffer(input: Buffer) {
  // Ensure RGB; some HEIC/CMYK inputs require normalization
  return sharp(input).withMetadata().toBuffer();
}

export async function makeVariant(buf: Buffer, width: number) {
  const piped = sharp(buf).resize({ width, withoutEnlargement: true });
  const webp = await piped.clone().webp({ quality: 82 }).toBuffer();
  const jpeg = await piped.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  const meta = await sharp(webp).metadata();
  return { webp, jpeg, width: meta.width!, height: meta.height! };
}
