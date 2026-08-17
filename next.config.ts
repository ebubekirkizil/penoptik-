import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["prisma/**/*"],
  },
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Aynı ağdaki telefondan erişime izin ver
  allowedDevOrigins: [
    "192.168.0.12",
    "192.168.1.12",
    "192.168.0.*",
    "192.168.1.*",
  ],
};

export default nextConfig;
