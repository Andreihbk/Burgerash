import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "../BrandLogo";
import { Display } from "../Display";
import SiteFooter from "../storefront/SiteFooter";
import { LEGAL_UPDATED } from "@/lib/legal";

/** Shared shell for the legal pages: wine header, sand body, same footer as the storefront. */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito pb-16 overflow-x-clip">
      <header className="bg-[#790D20] text-[#F5E6CC] border-b-2 border-[#332420] px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="burgerash, înapoi la meniu">
          <BrandLogo variant="horizontal" tone="sand" className="h-10 w-auto" />
        </Link>
        <Link href="/" className="font-bebas text-lg tracking-wider text-[#F5E6CC]/80 hover:text-[#F5E6CC]">
          <Display>ÎNAPOI LA MENIU</Display>
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-4 pt-10">
        <h1 className="font-bebas text-4xl sm:text-5xl leading-none text-[#790D20]">
          <Display>{title}</Display>
        </h1>
        <p className="font-mono text-xs mt-3 text-[#332420]/70">Ultima actualizare: {LEGAL_UPDATED}</p>
        <div className="mt-8 space-y-4 leading-relaxed [&_h2]:font-bebas [&_h2]:text-2xl [&_h2]:text-[#790D20] [&_h2]:mt-10 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-bold hover:[&_a]:text-[#790D20]">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

/** h2 that keeps Eatvetica away from diacritics and digits. */
export function H2({ children }: { children: string }) {
  return (
    <h2>
      <Display>{children}</Display>
    </h2>
  );
}
