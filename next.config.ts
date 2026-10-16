import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No on-screen Next.js indicator in development.
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  output: "export",
};

export default nextConfig;
