import Link from "next/link";
import { BrandLogo } from "../BrandLogo";
import { GOOGLE_MAPS_URL, INSTAGRAM_URL, SITE_ADDRESS } from "@/lib/site";
import { scheduleLines } from "@/lib/hours";
import { ANPC_SAL_URL, ANPC_SOL_URL, LEGAL_LINKS } from "@/lib/legal";

// ANPC banners (Ordin ANPC 449/2022): ~250x50, each links to the official page. Text versions in brand colours until
// the official ANPC images are added; the lawyer confirms the final form before launch.
const ANPC_BANNER =
  "group flex w-[250px] h-[50px] items-center gap-2.5 border-2 border-charcoal rounded-md bg-sand px-2.5 text-left hover:bg-wine hover:border-wine transition-colors";

const ANPC_BANNERS = [
  { href: ANPC_SAL_URL, code: "SAL", text: "Soluționarea alternativă a litigiilor" },
  { href: ANPC_SOL_URL, code: "SOL", text: "Soluționarea online a litigiilor" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t-2 border-charcoal/20 font-mono text-xs text-charcoal/70">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <BrandLogo variant="horizontal" tone="wine" className="h-10 w-auto shrink-0" />
          <div>
            <p className="font-bold text-charcoal">GOOD BURGERS /// GOOD PEOPLE /// ALWAYS</p>
            <p className="mt-1">Carne proaspătă, zilnic.</p>
            <p className="mt-1">
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-wine">
                {SITE_ADDRESS.line}
              </a>
            </p>
            <p className="mt-1">
              {scheduleLines().map((l) => `${l.label} ${l.hours}`).join(" · ")} ·{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-wine">
                Instagram
              </a>
            </p>
            <p className="mt-1">© 2026 Burgerash. Toate drepturile rezervate.</p>
          </div>
        </div>

        <nav aria-label="Informații legale" className="flex flex-col items-center sm:items-end">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-6 items-center underline underline-offset-2 hover:text-wine">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
        {ANPC_BANNERS.map((b) => (
          <a key={b.code} href={b.href} target="_blank" rel="noopener noreferrer" className={ANPC_BANNER}>
            <span className="shrink-0 font-nunito font-black text-xl leading-none text-wine group-hover:text-sand">
              {b.code}
            </span>
            <span className="flex flex-col leading-tight text-charcoal group-hover:text-sand">
              <span className="font-mono text-[9px] font-bold tracking-wider">ANPC</span>
              <span className="font-nunito font-bold text-[11px]">{b.text}</span>
            </span>
          </a>
        ))}
      </div>
    </footer>
  );
}
