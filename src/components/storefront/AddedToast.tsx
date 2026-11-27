"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

export default function AddedToast() {
  const lastAdded = useUiStore((s) => s.lastAdded);
  const addedSeq = useUiStore((s) => s.addedSeq);
  const clearAdded = useUiStore((s) => s.clearAdded);
  const openCart = useCartStore((s) => s.openCart);

  // Auto-hides 2.6s after the latest add (a new add restarts the timer).
  useEffect(() => {
    if (!addedSeq) return;
    const id = setTimeout(clearAdded, 2600);
    return () => clearTimeout(id);
  }, [addedSeq, clearAdded]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-50 left-4 right-4 bottom-40 md:left-auto md:right-6 md:bottom-6 pointer-events-none flex justify-center md:justify-end"
    >
      {lastAdded && (
        <div
          key={addedSeq}
          className="animate-toast-in pointer-events-auto flex items-center gap-4 bg-wine text-sand border-2 border-sand rounded-lg px-4 py-3 shadow-[4px_4px_0px_0px_var(--color-charcoal)]"
        >
          <Check className="w-5 h-5 shrink-0 stroke-[3]" />
          <div className="min-w-0">
            <p className="font-nunito font-black text-sm leading-tight">Adăugat în coș</p>
            <p className="font-mono text-[11px] text-sand/70 truncate">{lastAdded.name}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAdded();
              openCart();
            }}
            className="font-nunito font-extrabold text-sm underline underline-offset-4 whitespace-nowrap hover:text-sand/80"
          >
            Vezi coșul
          </button>
        </div>
      )}
    </div>
  );
}
