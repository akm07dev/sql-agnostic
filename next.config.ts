import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Custom webpack splitChunks config for production builds.
   * Turbopack bundles the entire React DOM runtime into a single chunk (~226KB)
   * which triggers Zscaler's deep packet inspection on corporate networks.
   * This splits it into smaller, less suspicious pieces.
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...((config.optimization?.splitChunks as any)?.cacheGroups || {}),
            // Split React DOM into its own named chunk
            reactDom: {
              test: /[\\/]node_modules[\\/]react-dom[\\/]/,
              name: "lib-react-dom",
              chunks: "all" as const,
              priority: 40,
              enforce: true,
            },
            // Split React scheduler separately
            scheduler: {
              test: /[\\/]node_modules[\\/]scheduler[\\/]/,
              name: "lib-scheduler",
              chunks: "all" as const,
              priority: 35,
              enforce: true,
            },
            // Group remaining framework code
            framework: {
              test: /[\\/]node_modules[\\/](react|next)[\\/]/,
              name: "lib-framework",
              chunks: "all" as const,
              priority: 30,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
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

