import type { NextConfig } from "next";
import { PRIVATE_PATHS } from "./src/lib/site";

// Staff pages are client components (no metadata export), so noindex is sent as a header from one place.
const staffPaths = PRIVATE_PATHS.filter((p) => !p.startsWith("/api"));

// Security headers (audit R7). Invisible to visitors; they tell the browser what the site may do.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// Enforced now: nobody may show our pages inside a frame (clickjacking on checkout), no plugins, no <base> tricks.
const CSP_ENFORCED = ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"].join("; ");

// Full policy in REPORT-ONLY mode: the browser only logs what it would block (DevTools console), nothing breaks.
// 'unsafe-inline' for scripts is needed while the homepage stays static (Next inlines its page data; nonces
// would make every page dynamic). When Netopia is added, put its domains here, check the console, then enforce.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://tiles.openfreemap.org ${supabaseOrigin} ${supabaseWs}`.trim(),
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_ENFORCED },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // No includeSubDomains/preload on purpose: those are hard to undo if a subdomain ever needs plain HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Always define the flag so it is inlined at build time; with "false" the temporary map radius slider is dead-code-eliminated.
  env: { NEXT_PUBLIC_MAP_TUNING: process.env.NEXT_PUBLIC_MAP_TUNING === "true" ? "true" : "false" },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      ...staffPaths.map((path) => ({
        source: `${path}/:path*`,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};

export default nextConfig;
