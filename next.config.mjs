/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  images: {
    // if you later use next/image with remote patterns:
    remotePatterns: [
      { protocol: 'https', hostname: 'thcmembersonlyclub.s3.us-west-2.amazonaws.com' }
    ]
  }
};
export default nextConfig;
