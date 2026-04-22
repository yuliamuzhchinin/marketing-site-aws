const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // only force static export in production
  ...(isProd ? { output: "export" } : {}),

  images: { unoptimized: true },
  trailingSlash: true,  
};

export default nextConfig;
