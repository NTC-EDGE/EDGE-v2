import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint check during production builds since we check it independently
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds since we run check-types independently
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
