// Pre-launch switch. Online ordering is on ONLY when NEXT_PUBLIC_ORDERING_ENABLED is exactly "true".
// NEXT_PUBLIC_ vars are inlined at build time, so changing it in Vercel needs a redeploy.
// The same flag gates the storefront UI and /api/orders (server-side). Staff apps are not affected.

export const ORDERING_CLOSED_BANNER = "Deschidem în curând! Comenzile online pornesc la lansare.";

export function isOrderingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ORDERING_ENABLED === "true";
}
