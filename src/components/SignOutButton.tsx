"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Staff sign-out: clears the Supabase session cookies, then a full navigation to the login page
// (full load so Realtime channels close and proxy.ts sees the cleared cookies).
export default function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.assign("/staff/login");
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="min-h-11 px-4 font-nunito font-bold text-sm border-2 border-[#F5E6CC] bg-transparent text-[#F5E6CC] disabled:opacity-60"
    >
      IEȘI
    </button>
  );
}
