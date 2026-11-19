"use client";

import { MENU_SECTIONS } from "@/lib/catalog";
import { BrandLogo } from "./BrandLogo";
import { Display } from "@/components/Display";

const LINE_CLASS =
  "flex w-full justify-between items-center font-nunito font-black text-[1em] text-[#332420] rounded";

function Line({
  name,
  price,
  weight,
  onSelect,
  onLineActive,
}: {
  name: string;
  price: number;
  weight?: string | null;
  onSelect?: (name: string) => void;
  onLineActive?: (name: string | null) => void;
}) {
  const content = (
    <>
      <span>
        {name}
        {weight && <span className="ml-[0.5em] text-[0.7em] font-bold text-[#332420]/70">{weight}</span>}
      </span>
      <span>{price}</span>
    </>
  );
  if (!onSelect) {
    return <div className={LINE_CLASS}>{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      onMouseEnter={onLineActive && (() => onLineActive(name))}
      onMouseLeave={onLineActive && (() => onLineActive(null))}
      onFocus={onLineActive && (() => onLineActive(name))}
      onBlur={onLineActive && (() => onLineActive(null))}
      aria-label={`Personalizează ${name}, ${price} RON`}
      className={`${LINE_CLASS} min-h-[44px] text-left hover:text-[#790D20] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]`}
    >
      {content}
    </button>
  );
}

// Lightbox menu board, as on the physical sign. Prices follow the menu board.
export default function MenuBoard({
  linkedNames = [],
  onLineActive,
  onSelect,
  lit = true,
}: {
  /** Sign switched on (open) or off (closed). */
  lit?: boolean;
  /** Lines that react to hover/focus (they bring their sticker to the top of the stack). */
  linkedNames?: string[];
  onLineActive?: (name: string | null) => void;
  /** Tap/click/Enter on a product line (opens that product). */
  onSelect?: (name: string) => void;
}) {
  return (
    <section id="lightboard" data-lit={lit ? "on" : "off"} aria-label="Panou meniu" className="lightbox-board w-full mx-auto scroll-mt-24">
      <div className="lightbox-frame bg-[#790D20] p-[1em] rounded-[0.75em] border-4 border-[#332420]">
        <div className="lightbox-panel bg-[#F5E6CC] text-[#790D20] p-[1.5em] sm:p-[2em] rounded-lg border-2 border-[#790D20]/30 relative">
          {/* Header Panou */}
          <div className="text-center mb-[1.5em]">
            <div className="inline-flex flex-col items-center">
              <BrandLogo variant="full" tone="wine" className="h-[7em] w-auto" />
            </div>
          </div>

          {/* Secțiunile Panoului Luminos */}
          <div className="space-y-[1.1em]">
            {MENU_SECTIONS.map(({ category, products }) => ({
              title: category.name,
              items: products.map((p) => ({ name: p.name, price: p.price, weight: p.weight_label })),
            })).map((group) => (
              <div key={group.title} className="relative pr-[1.25em]">
                <div className="flex items-center gap-3 mb-[0.4em]">
                  <h3 className="font-bebas text-[1.4em] leading-none text-[#332420] shrink-0">
                    <Display>{group.title}</Display>
                  </h3>
                  <div className="flex-1 h-2 border-y-2 border-[#790D20] rounded-tr-xl" />
                </div>
                <div className="space-y-0 pl-1 border-r-4 border-double border-[#790D20] pr-[1em]">
                  {group.items.map((it) => (
                    <Line
                      key={it.name}
                      name={it.name}
                      price={it.price}
                      weight={it.weight}
                      onSelect={onSelect}
                      onLineActive={linkedNames.includes(it.name) ? onLineActive : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Panou Luminos */}
          <div className="mt-[1.25em] pt-[0.75em] border-t-4 border-double border-[#790D20] flex justify-end">
            <div className="font-nunito font-black text-[0.75em] tracking-widest text-[#332420] leading-tight text-right">
              <p>GOOD BURGERS</p>
              <p>GOOD PEOPLE</p>
              <p>ALWAYS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
