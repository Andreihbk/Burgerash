import { PARTNER_APPS } from "@/lib/site";
import { Display } from "@/components/Display";

// Partner brand colors (Glovo yellow, Wolt blue): allowed ONLY on these two small buttons (see CLAUDE.md).
const STYLE = {
  Glovo: "bg-[#FFC244] text-[#332420]",
  Wolt: "bg-[#009DE0] text-white",
} as const;

/** Quiet secondary links to the delivery apps, under our own order button. Archive look, smaller. */
export default function PartnerApps() {
  const base =
    "inline-flex items-center gap-1.5 font-bebas text-lg leading-none px-4 py-2 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] transition-transform";
  return (
    <div>
      <p className="font-mono text-[11px] font-bold tracking-widest text-[#332420]/70 mb-2">SAU PE APLICAȚII</p>
      <div className="flex flex-wrap gap-3">
        {PARTNER_APPS.map(({ name, url }) =>
          url ? (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${base} ${STYLE[name]} hover:-translate-y-0.5`}
            >
              <Display>{name.toUpperCase()}</Display>
            </a>
          ) : (
            <span key={name} className={`${base} ${STYLE[name]} opacity-60`} aria-disabled="true">
              <Display>{name.toUpperCase()}</Display>
              <span className="font-mono text-[10px] font-bold tracking-wider">ÎN CURÂND</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
