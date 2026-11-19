import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase";

// Server-only Supabase client with the service_role key: bypasses RLS.
// Used ONLY by /api/orders (create_order) and the Ebriza sync (sync status write).
// SUPABASE_SERVICE_ROLE_KEY must never get a NEXT_PUBLIC_ prefix or reach the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(isSupabaseConfigured && serviceRoleKey);

export const supabaseAdmin: SupabaseClient = createClient(
  isSupabaseAdminConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseAdminConfigured ? serviceRoleKey : "placeholder-service-role-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
