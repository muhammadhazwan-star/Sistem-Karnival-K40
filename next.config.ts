import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Allow cross-origin requests from preview/chat domains
  allowedDevOrigins: ["*.space-z.ai", "*.chat.z.ai"],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-admin-token" },
        ],
      },
    ];
  },
};

export default nextConfig;
