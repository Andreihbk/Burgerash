import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "../BrandLogo";
import { Display } from "../Display";
import SiteFooter from "../storefront/SiteFooter";
import { LEGAL_UPDATED } from "@/lib/legal";

/** Shared shell for the legal pages: wine header, sand body, same footer as the storefront. */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sand text-charcoal font-nunito pb-16 overflow-x-clip">
      <header className="bg-wine text-sand border-b-2 border-charcoal px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="burgerash, înapoi la meniu">
          <BrandLogo variant="horizontal" tone="sand" className="h-10 w-auto" />
        </Link>
        <Link href="/" className="font-display text-lg tracking-wider text-sand/80 hover:text-sand">
          <Display>ÎNAPOI LA MENIU</Display>
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-4 pt-10">
        <h1 className="font-display text-4xl sm:text-5xl leading-none text-wine">
          <Display>{title}</Display>
        </h1>
        <p className="font-mono text-xs mt-3 text-charcoal/70">Ultima actualizare: {LEGAL_UPDATED}</p>
        <div className="mt-8 space-y-4 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-wine [&_h2]:mt-10 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-bold hover:[&_a]:text-wine">
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
