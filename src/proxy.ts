import { NextResponse, type NextRequest } from "next/server";
import { STAFF_COOKIE, safeEqual, staffToken } from "@/lib/staff-auth";

// TEMPORARY password gate for staff pages. Replace with Supabase Auth + RLS (PLAN L.0).
// Fails closed: with no STAFF_PASSWORD set, nobody gets in.
export async function proxy(request: NextRequest) {
  const password = process.env.STAFF_PASSWORD;
  const cookie = request.cookies.get(STAFF_COOKIE)?.value;

  if (password && cookie && safeEqual(cookie, await staffToken(password))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/staff-login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/kitchen/:path*", "/dispatch/:path*", "/rider/:path*"],
};
