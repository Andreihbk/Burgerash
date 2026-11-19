import type { NextConfig } from "next";
import { PRIVATE_PATHS } from "./src/lib/site";

// Staff pages are client components (no metadata export), so noindex is sent as a header from one place.
const staffPaths = PRIVATE_PATHS.filter((p) => !p.startsWith("/api"));

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Always define the flag so it is inlined at build time; with "false" the temporary map radius slider is dead-code-eliminated.
  env: { NEXT_PUBLIC_MAP_TUNING: process.env.NEXT_PUBLIC_MAP_TUNING === "true" ? "true" : "false" },
  async headers() {
    return staffPaths.map((path) => ({
      source: `${path}/:path*`,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;
