import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { safeNext } from "@/lib/safe-next";

// Staff login with Supabase Auth (PLAN L.0b step 2). Sets the session cookies on the redirect response.
// The old password gate (proxy.ts, /staff-login) still runs until step 3 swaps it for this session.
// "authenticated = staff" holds only while sign-ups and anonymous sign-ins are OFF in Supabase Auth.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const next = safeNext(String(form.get("next") ?? ""));
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const fail = (error: string) => {
    const url = new URL("/staff/login", request.url);
    url.searchParams.set("error", error);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  };

  if (!isSupabaseConfigured) return fail("config");
  if (!email || !password) return fail("credentials");

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Same message for a wrong email and a wrong password; Supabase rate-limits attempts.
    return fail(error.status === 429 ? "rate" : "credentials");
  }

  response.headers.set("Cache-Control", "no-store");
  return response;
}
