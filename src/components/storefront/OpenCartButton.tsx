"use client";

import { useCartStore } from "@/store/cartStore";

export default function OpenCartButton({ className, children }: { className: string; children: React.ReactNode }) {
  const openCart = useCartStore((s) => s.openCart);
  return (
    <button type="button" onClick={openCart} className={className}>
      {children}
    </button>
  );
}
