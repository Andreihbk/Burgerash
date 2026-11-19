import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

// Staff pages require a Supabase Auth session (PLAN L.0b). getUser() asks the Auth server,
// so a forged or expired cookie does not pass. Refreshed session cookies go on the response.
// Fails closed: with Supabase not configured, nobody gets in.
// The real protection is RLS (anon has no access to orders); this only keeps the pages private.
export async function proxy(request: NextRequest) {
  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/staff/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured) return toLogin();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies, headers) => {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return toLogin();

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/kitchen/:path*", "/dispatch/:path*", "/rider/:path*", "/admin/:path*"],
};
