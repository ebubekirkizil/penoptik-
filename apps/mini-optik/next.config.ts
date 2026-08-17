import type { NextConfig } from "next";
const path = require("path");

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  // @ts-ignore
  eslint: { ignoreDuringBuilds: true },
  experimental: { externalDir: true },
  outputFileTracingIncludes: {
    "/*": ["prisma/**/*"],
  },
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  allowedDevOrigins: ["192.168.0.12", "192.168.1.12", "192.168.0.*", "192.168.1.*"],
  async redirects() {
    return [
      {
        source: '/login/admin',
        destination: '/admin/login',
        permanent: true,
      },
    ]
  },
  turbopack: {},
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
