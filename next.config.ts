import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Useful for isolated CI/build verification on Windows workspaces where an
  // existing development cache can be held by OneDrive or a running dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
