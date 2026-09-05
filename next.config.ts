import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel requires the default `.next` output directory. On local OneDrive
  // workspaces, NEXT_DIST_DIR may be set temporarily for an isolated build.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
