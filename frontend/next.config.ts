import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure prisma works well in server environments
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;

