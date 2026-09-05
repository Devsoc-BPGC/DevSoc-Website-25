import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  // Three.js and GSAP ship ESM; keep them out of the server bundle graph.
  transpilePackages: ["three"],
};

export default nextConfig;
