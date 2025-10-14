/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next to produce a static export
  output: 'export',
  // Safe for S3/CF (no image optimizer needed)
  images: { unoptimized: true },
};

export default nextConfig;
