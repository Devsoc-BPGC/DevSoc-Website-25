import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No on-screen Next.js indicator in development.
  devIndicators: false,
  images: {
    formats: ["image/webp"],
    // 92 is for the one print that is shown at full size on a poster.
    qualities: [75, 92],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  output: "export",
};

export default nextConfig;
