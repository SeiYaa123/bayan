import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Domaines autorisés pour les images (Clerk avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
