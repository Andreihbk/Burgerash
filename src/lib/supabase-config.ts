// Public Supabase settings (URL + anon key), with no supabase-js import, so the storefront can read
// them without pulling the client into its first load (audit R2). Staff code keeps using src/lib/supabase.ts.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    supabaseUrl.startsWith("http")
);
