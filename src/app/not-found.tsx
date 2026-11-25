import type { Metadata } from "next";
import Link from "next/link";
import { BurgerStamp } from "@/components/BurgerStamp";
import { Display } from "@/components/Display";
import { INITIAL_PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = { title: "Pagina nu există", robots: { index: false } };

const sticker = INITIAL_PRODUCTS.find((p) => p.id === "prod-hot-boy") ?? INITIAL_PRODUCTS[0];

/** Branded 404: one sticker, one line, one way back. */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito grid place-items-center px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <div className="w-36 h-36 sm:w-44 sm:h-44 -rotate-12 drop-shadow-[4px_4px_0px_#332420]">
          <BurgerStamp product={sticker} className="h-full w-full" />
        </div>
        <p className="mt-8 font-mono text-xs font-bold tracking-widest text-[#790D20]">404</p>
        <h1 className="font-bebas text-5xl sm:text-7xl leading-none mt-1">
          <Display>AICI NU E NIMIC.</Display>
        </h1>
        <p className="mt-4 font-semibold text-lg text-[#332420]/80">Burgerii sunt în altă parte.</p>
        <Link
          href="/"
          className="mt-8 inline-block font-bebas text-2xl px-8 py-3.5 rounded-lg bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] transition-colors"
        >
          <Display>ÎNAPOI LA MENIU</Display>
        </Link>
      </div>
    </main>
  );
}
