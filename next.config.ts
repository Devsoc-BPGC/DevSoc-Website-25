import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No on-screen Next.js indicator in development.
  devIndicators: false,
  // The team page became the coordinators' scene on the home page.
  async redirects() {
    return [{ source: "/team", destination: "/#crew", statusCode: 301 }];
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
};

export default nextConfig;
