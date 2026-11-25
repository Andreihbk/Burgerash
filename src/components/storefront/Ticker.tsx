import { BurgerGlyph } from "../BrandLogo";
import { Display } from "@/components/Display";

const ITEMS = [
  "YOUR LOCAL BURGER SPOT",
  "HANDCRAFTED BURGERS",
  "PROASPĂT PE PLITĂ",
  "LIVRARE PROPRIE",
  "RIDICARE ÎN 15 MIN",
  "PLATA ONLINE CU CARDUL",
];

// Each loop repeats the list twice (wide screens); the track holds two loops, so translating
// it by -50% wraps seamlessly.
function Loop() {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {[...ITEMS, ...ITEMS].map((text, i) => (
        <li key={i} className="flex items-center gap-6 pr-6 whitespace-nowrap">
          <span className="font-bebas text-2xl sm:text-3xl tracking-wider leading-none">
            <Display>{text}</Display>
          </span>
          <BurgerGlyph className="h-5 w-5 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

function Strip({ className = "" }: { className?: string }) {
  return (
    <div className={`ticker overflow-hidden bg-[#790D20] text-[#F5E6CC] py-3 border-y-[3px] border-[#332420] ${className}`}>
      <div className="ticker-track flex w-max">
        <Loop />
        <Loop />
      </div>
    </div>
  );
}

/** Full-width marquee under the hero: one slightly tilted strip. */
export default function Ticker() {
  return (
    <div className="relative py-6 overflow-x-clip">
      <p className="sr-only">{ITEMS.join(" · ")}</p>
      <Strip className="-mx-[4%] w-[108%] -rotate-1 shadow-[0_4px_0_0_#332420]" />
    </div>
  );
}
