import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack's rapidly-changing development manifests away from the
  // production build output. This project lives in OneDrive, where sharing a
  // single `.next` directory caused intermittent missing-manifest errors and
  // client navigation stalls. Vercel and `next build` still use `.next`.
  distDir:
    process.env.NEXT_DIST_DIR ??
    (process.env.NODE_ENV === "development" ? ".next-dev" : ".next"),
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
