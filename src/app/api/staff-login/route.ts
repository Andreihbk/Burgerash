import { NextResponse, type NextRequest } from "next/server";
import { STAFF_COOKIE, STAFF_COOKIE_MAX_AGE, safeEqual, safeNext, staffToken } from "@/lib/staff-auth";

// TEMPORARY staff password login. Replace with Supabase Auth (PLAN L.0).
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const next = safeNext(String(form.get("next") ?? ""));
  const given = String(form.get("password") ?? "");
  const expected = process.env.STAFF_PASSWORD;

  const fail = (error: string) => {
    const url = new URL("/staff-login", request.url);
    url.searchParams.set("error", error);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  };

  if (!expected) return fail("config");
  if (!safeEqual(await staffToken(given), await staffToken(expected))) return fail("password");

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(STAFF_COOKIE, await staffToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_COOKIE_MAX_AGE,
  });
  return response;
}
