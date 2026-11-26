import Link from "next/link";
import { BrandLogo } from "../BrandLogo";
import { GOOGLE_MAPS_URL, INSTAGRAM_URL, SITE_ADDRESS } from "@/lib/site";
import { scheduleLines } from "@/lib/hours";
import { ANPC_SAL_URL, ANPC_SOL_URL, LEGAL_LINKS } from "@/lib/legal";

const BADGE =
  "inline-block border-2 border-[#332420] px-2 py-1 font-bold text-[#332420] hover:bg-[#790D20] hover:text-[#F5E6CC] hover:border-[#790D20] transition-colors";

export default function SiteFooter() {
  return (
    <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t-2 border-[#332420]/20 font-mono text-xs text-[#332420]/70">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <BrandLogo variant="horizontal" tone="wine" className="h-10 w-auto shrink-0" />
          <div>
            <p className="font-bold text-[#332420]">GOOD BURGERS /// GOOD PEOPLE /// ALWAYS</p>
            <p className="mt-1">Carne proaspătă, zilnic.</p>
            <p className="mt-1">
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#790D20]">
                {SITE_ADDRESS.line}
              </a>
            </p>
            <p className="mt-1">
              {scheduleLines().map((l) => `${l.label} ${l.hours}`).join(" · ")} ·{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#790D20]">
                Instagram
              </a>
            </p>
            <p className="mt-1">© 2026 Burgerash. Toate drepturile rezervate.</p>
          </div>
        </div>

        <nav aria-label="Informații legale" className="flex flex-col items-center sm:items-end gap-1">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="underline underline-offset-2 hover:text-[#790D20]">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
        <a href={ANPC_SAL_URL} target="_blank" rel="noopener noreferrer" className={BADGE}>
          ANPC SAL
        </a>
        <a href={ANPC_SOL_URL} target="_blank" rel="noopener noreferrer" className={BADGE}>
          SOL
        </a>
      </div>
    </footer>
  );
}
