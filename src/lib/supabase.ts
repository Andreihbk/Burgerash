import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase-config";

export { isSupabaseConfigured };

// Browser client for the staff pages (/kitchen /dispatch /rider). It reads the Supabase Auth session
// from the cookies set by /api/staff-auth/login, so queries and Realtime run as `authenticated`.
// Without a session it is plain anon, which RLS gives no access to orders (PLAN L.0b).
// Server code that must bypass RLS uses src/lib/supabase-admin.ts instead.
export const supabase: SupabaseClient = createBrowserClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
