import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable PPR as it causes issues with authenticated routes
    // ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true,
  },
};

export default nextConfig;
