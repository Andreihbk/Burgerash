// TEMPORARY staff password gate (server-side only). Replace with Supabase Auth + RLS (PLAN: Before launch L.0).
// The cookie holds a SHA-256 of STAFF_PASSWORD + salt, never the password itself.

export const STAFF_COOKIE = "burgerash_staff";
export const STAFF_COOKIE_MAX_AGE = 60 * 60 * 12; // 12h, about one shift

export async function staffToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`burgerash-staff-gate:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Only allow same-site relative redirects. */
export function safeNext(value: string | null | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/kitchen";
}
