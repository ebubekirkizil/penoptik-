import type { NextConfig } from "next";
const path = require("path");

const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/*": ["prisma/**/*"],
  },
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  allowedDevOrigins: ["192.168.0.12", "192.168.1.12", "192.168.0.*", "192.168.1.*"],
  async rewrites() {
    return [
      {
        source: '/ebubekir-kizildas',
        destination: 'https://nfs-modeller.vercel.app/',
      },
      {
        source: '/ebubekir-kizildas/:path*',
        destination: 'https://nfs-modeller.vercel.app/:path*',
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      "@/components": "../../packages/ui/src/components",
      "@/lib": "../../packages/ui/src/lib",
      "@/hooks": "../../packages/ui/src/hooks",
      "@/types": "../../packages/ui/src/types",
      "@/prisma": "../../packages/database/src",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components": path.resolve(__dirname, "../../packages/ui/src/components"),
      "@/lib": path.resolve(__dirname, "../../packages/ui/src/lib"),
      "@/hooks": path.resolve(__dirname, "../../packages/ui/src/hooks"),
      "@/types": path.resolve(__dirname, "../../packages/ui/src/types"),
      "@/prisma": path.resolve(__dirname, "../../packages/database/src"),
    };
    return config;
  },
};

export default nextConfig;
