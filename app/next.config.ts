import type { NextConfig } from "next";
import { config } from "dotenv";

// Environment files deliberately remain at the workspace root, outside the
// deployable app directory, so local secrets do not get mixed with UI code.
config({ path: "../.env.local", quiet: true });
config({ path: "../.env", quiet: true });

const nextConfig: NextConfig = {
  // Keep Turbopack's rapidly-changing development manifests away from the
  // production build output. This project lives in OneDrive, where sharing a
  // single `.next` directory caused intermittent missing-manifest errors and
  // client navigation stalls. Vercel and `next build` still use `.next`.
  distDir:
    process.env.NEXT_DIST_DIR ??
    (process.env.NODE_ENV === "development" ? ".next-dev" : ".next"),
  outputFileTracingRoot: process.cwd(),
  // These reviewed catalogues are read by server routes at runtime. Keep the
  // source files in a Vercel function bundle instead of relying on the build
  // machine's filesystem after deployment.
  outputFileTracingIncludes: {
    "/api/education/catalogue": ["./src/data/india_180_plus_courses.csv", "./src/data/india_300_plus_degrees_programmes.csv"],
    "/api/radar": ["./src/data/india_100_plus_scholarships.csv"],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
