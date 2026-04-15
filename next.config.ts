import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Custom webpack config for production builds.
   * 1. splitChunks: Break React DOM into smaller chunks to avoid Zscaler blocks
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
              test: /[\\/]node_modules[\\/]react-dom[\\/].*\.(js|mjs)$/,
              name: "lib-react-dom",
              chunks: "all" as const,
              priority: 40,
              enforce: true,
            },
            // Split React scheduler separately
            scheduler: {
              test: /[\\/]node_modules[\\/]scheduler[\\/].*\.(js|mjs)$/,
              name: "lib-scheduler",
              chunks: "all" as const,
              priority: 35,
              enforce: true,
            },
            // Group remaining framework code
            framework: {
              test: /[\\/]node_modules[\\/](react|next)[\\/].*\.(js|mjs)$/,
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

