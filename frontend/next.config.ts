import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    domains: ['localhost', 'placehold.co', 'picsum.photos', 'lh3.googleusercontent.com', 'via.placeholder.com'],
    unoptimized: true
  },
};

export default nextConfig;
