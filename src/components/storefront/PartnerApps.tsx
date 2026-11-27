import { PARTNER_APPS } from "@/lib/site";
import { Display } from "@/components/Display";

// Partner brand colors (Glovo yellow, Wolt blue): allowed ONLY on these two buttons (see CLAUDE.md).
const STYLE = {
  Glovo: "bg-[#FFC244] text-charcoal",
  Wolt: "bg-[#009DE0] text-white",
} as const;

/** Secondary links to the delivery apps, under our own (bigger, wine) order button. Archive look. */
export default function PartnerApps() {
  const base =
    "inline-flex flex-col items-center justify-center gap-1 font-display text-2xl sm:text-3xl leading-none px-3 sm:px-6 py-3.5 rounded-lg border-2 border-charcoal shadow-[4px_4px_0px_0px_var(--color-charcoal)] transition-transform";
  return (
    <div>
      <p className="font-mono text-xs font-bold tracking-widest text-charcoal/70 mb-3">SAU PE APLICAȚII</p>
      <div className="grid grid-cols-2 gap-3">
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
              <span className="font-mono text-[11px] font-bold tracking-wider">ÎN CURÂND</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
