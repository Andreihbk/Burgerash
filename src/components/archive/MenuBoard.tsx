"use client";

import { MENU_SECTIONS } from "@/lib/catalog";
import { useSoldOutIds } from "@/lib/useSoldOut";
import type { Product } from "@/types/database";
import { BrandLogo } from "@/components/BrandLogo";
import { Display } from "@/components/Display";

const WINE = "#790D20";
// Rail strokes are drawn in a 24-unit box that is 1.5em tall, so 1 unit = 1/16 em.
const RAIL_STROKE = 2.5;

/** "280g" -> "(280 g)", "6 buc (aprox. 180g)" -> "(6 buc, aprox. 180 g)". */
function formatWeight(label: string): string {
  const spaced = label.replace(/(\d)(g|ml)\b/g, "$1 $2").replace(/\s*\(([^)]*)\)/, ", $1");
  return `(${spaced})`;
}

function allergenLine(allergens: string[] | null): string | null {
  if (allergens === null) return "Alergeni: întreabă-ne";
  if (allergens.length === 0) return null;
  return `Alergeni: ${allergens.join(", ")}`;
}

/** Straight part of the double rail, stretched to fill the space after the section title. */
function RailLine() {
  return (
    <svg aria-hidden viewBox="0 0 100 24" preserveAspectRatio="none" className="block h-[1.5em] min-w-[1.5em] flex-1">
      <g stroke={WINE} strokeWidth={RAIL_STROKE} fill="none">
        <line x1="0" y1="9" x2="100" y2="9" />
        <line x1="0" y1="17" x2="100" y2="17" />
      </g>
    </svg>
  );
}

/** Rail corner: both lines turn down along the section's right edge (concentric arcs). */
function RailCorner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="hidden sm:block h-[1.5em] w-[1.5em]">
      <g stroke={WINE} strokeWidth={RAIL_STROKE} fill="none">
        <path d="M0 9 H9 A12 12 0 0 1 21 21 V24" />
        <path d="M0 17 H9 A4 4 0 0 1 13 21 V24" />
      </g>
    </svg>
  );
}

/** Vertical part of the rail, stretched to the section's height. */
function RailDrop() {
  return (
    // Absolutely positioned so the SVG's own aspect ratio never sizes the grid row.
    <div aria-hidden className="relative hidden sm:block">
      <svg viewBox="0 0 24 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <g stroke={WINE} strokeWidth={RAIL_STROKE} fill="none">
          <line x1="13" y1="0" x2="13" y2="100" />
          <line x1="21" y1="0" x2="21" y2="100" />
        </g>
      </svg>
    </div>
  );
}

/** Swooping double stripe along the bottom of the board. */
function BottomSwoop() {
  return (
    <svg aria-hidden viewBox="0 0 400 48" preserveAspectRatio="none" className="block h-[2.5em] w-full">
      <g stroke={WINE} strokeWidth="3" fill="none">
        <path d="M0 26 H190 C250 26 270 6 330 6 H400" vectorEffect="non-scaling-stroke" />
        <path d="M0 38 H196 C256 38 276 18 336 18 H400" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

const ROW_CLASS = "flex w-full items-start justify-between gap-[0.75em] py-[0.45em] text-left rounded";

function Line({
  product,
  soldOut,
  onSelect,
  onLineActive,
}: {
  product: Product;
  soldOut: boolean;
  onSelect?: (name: string) => void;
  onLineActive?: (name: string | null) => void;
}) {
  const { name, price, weight_label: weight, description } = product;
  const allergens = allergenLine(product.allergens);

  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-[0.5em] gap-y-[0.1em]">
          <span className={`font-display text-[1.15em] leading-tight text-wine ${soldOut ? "line-through decoration-2" : ""}`}>
            <Display>{name}</Display>
          </span>
          {weight && <span className="font-mono text-[0.7em] text-charcoal">{formatWeight(weight)}</span>}
          {soldOut && (
            <span className="font-display text-[0.75em] leading-none px-[0.5em] py-[0.25em] rounded bg-wine text-sand">
              <Display>EPUIZAT</Display>
            </span>
          )}
        </span>
        {description && (
          <span className="block font-nunito font-semibold text-[0.85em] leading-snug text-charcoal mt-[0.15em]">
            {description}
          </span>
        )}
        {allergens && (
          <span className="block font-nunito text-[0.7em] leading-snug text-charcoal/70 mt-[0.15em]">{allergens}</span>
        )}
      </span>
      <span
        className={`shrink-0 font-nunito font-bold tabular-nums text-[1.05em] leading-tight text-wine whitespace-nowrap ${soldOut ? "opacity-60" : ""}`}
      >
        {price} lei
      </span>
    </>
  );

  if (!onSelect) {
    return <div className={ROW_CLASS}>{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      onMouseEnter={onLineActive && (() => onLineActive(name))}
      onMouseLeave={onLineActive && (() => onLineActive(null))}
      onFocus={onLineActive && (() => onLineActive(name))}
      onBlur={onLineActive && (() => onLineActive(null))}
      aria-label={`Personalizează ${name}, ${price} RON${soldOut ? ", epuizat" : ""}`}
      className={`${ROW_CLASS} min-h-[44px] px-[0.35em] -mx-[0.35em] w-[calc(100%+0.7em)] hover:bg-wine/5 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine`}
    >
      {content}
    </button>
  );
}

// Lightbox menu board, styled like the printed board in the shop. Prices follow the menu board.
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
  const soldOutIds = useSoldOutIds();

  return (
    <section id="lightboard" data-lit={lit ? "on" : "off"} aria-label="Panou meniu" className="lightbox-board w-full mx-auto scroll-mt-24">
      <div className="lightbox-frame bg-wine p-[0.9em] rounded-[1.25em]">
        <div className="lightbox-panel relative overflow-hidden bg-sand text-wine rounded-[0.75em]">
          {/* Printed inner border */}
          <div aria-hidden className="pointer-events-none absolute inset-[0.45em] rounded-[0.5em] border border-wine/40" />

          <div className="relative px-[1.25em] pt-[1.5em] sm:px-[2em] sm:pt-[2em]">
            <div className="flex justify-center mb-[1.5em]">
              <BrandLogo variant="full" tone="wine" className="h-[6.5em] w-auto" />
            </div>

            <div className="space-y-[1.4em]">
              {MENU_SECTIONS.map(({ category, products }) => (
                <div key={category.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_1.5em]">
                  <div className="flex items-center gap-[0.6em] min-w-0">
                    <h3 className="font-display text-[1.45em] leading-none text-wine shrink-0">
                      <Display>{category.name}</Display>
                    </h3>
                    <RailLine />
                  </div>
                  <RailCorner />

                  <div className="min-w-0 pt-[0.35em] sm:pr-[0.75em]">
                    {products.map((product) => (
                      <Line
                        key={product.id}
                        product={product}
                        soldOut={soldOutIds.has(product.id)}
                        onSelect={onSelect}
                        onLineActive={linkedNames.includes(product.name) ? onLineActive : undefined}
                      />
                    ))}
                  </div>
                  <RailDrop />
                </div>
              ))}
            </div>

            <p className="font-display text-[1.2em] leading-none text-wine text-right mt-[1.75em]">
              <Display>YOUR LOCAL BURGER SPOT.</Display>
            </p>
          </div>

          <div className="relative mt-[0.5em] mb-[0.9em]">
            <BottomSwoop />
          </div>
        </div>
      </div>
    </section>
  );
}
