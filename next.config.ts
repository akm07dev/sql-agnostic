import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:53321/api/:path*"
            : "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
