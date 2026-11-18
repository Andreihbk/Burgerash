"use client";

import { BrandLogo } from "./BrandLogo";

// Lightbox menu board, as on the physical sign. Prices follow the menu board.
export default function MenuBoard({
  linkedNames = [],
  onLineActive,
  lit = true,
}: {
  /** Sign switched on (open) or off (closed). */
  lit?: boolean;
  /** Lines that react to hover/focus (they bring their sticker to the top of the stack). */
  linkedNames?: string[];
  onLineActive?: (name: string | null) => void;
}) {
  return (
    <section id="lightboard" data-lit={lit ? "on" : "off"} aria-label="Panou meniu" className="lightbox-board w-full mx-auto scroll-mt-24">
      <div className="lightbox-frame bg-[#790D20] p-[1em] rounded-[0.75em] border-4 border-[#332420]">
        <div className="lightbox-panel bg-[#F5E6CC] text-[#790D20] p-[1.5em] sm:p-[2em] rounded-lg border-2 border-[#790D20]/30 relative">
          {/* Header Panou */}
          <div className="text-center mb-[1.5em]">
            <div className="inline-flex flex-col items-center">
              <BrandLogo layout="stacked" className="h-[5em] w-auto text-[#790D20]" />
              <p className="font-nunito font-bold text-[0.75em] tracking-widest text-[#332420]">
                hand crafted burgers
              </p>
            </div>
          </div>

          {/* Secțiunile Panoului Luminos */}
          <div className="space-y-[1.1em]">
            {[
              {
                title: "BURGERS",
                items: [
                  { name: "CLASIC", price: 36 },
                  { name: "HOT BOY", price: 39 },
                  { name: "DOUBLE", price: 46 },
                ],
              },
              {
                title: "CHICKEN",
                items: [
                  { name: "CHICKEN BURGER", price: 38 },
                  { name: "HOT HONEY", price: 38 },
                ],
              },
              {
                title: "SIDES & SAUCES",
                items: [
                  { name: "FRIES", price: 13 },
                  { name: "SAUCES", price: 5 },
                ],
              },
              {
                title: "DRINKS",
                items: [
                  { name: "COLA", price: 9 },
                  { name: "FANTA", price: 9 },
                  { name: "SPRITE", price: 9 },
                  { name: "WATER", price: 8 },
                ],
              },
            ].map((group) => (
              <div key={group.title} className="relative pr-[1.25em]">
                <div className="flex items-center gap-3 mb-[0.4em]">
                  <h3 className="font-bebas text-[1.5em] leading-none tracking-wider text-[#332420] shrink-0">
                    {group.title}
                  </h3>
                  <div className="flex-1 h-2 border-y-2 border-[#790D20] rounded-tr-xl" />
                </div>
                <div className="space-y-[0.3em] pl-1 border-r-4 border-double border-[#790D20] pr-[1em]">
                  {group.items.map((it) => (
                    <div
                      key={it.name}
                      {...(onLineActive && linkedNames.includes(it.name)
                        ? {
                            tabIndex: 0,
                            onMouseEnter: () => onLineActive(it.name),
                            onMouseLeave: () => onLineActive(null),
                            onFocus: () => onLineActive(it.name),
                            onBlur: () => onLineActive(null),
                          }
                        : {})}
                      className="flex justify-between items-center font-nunito font-black text-[1em] text-[#332420] rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
                    >
                      <span>{it.name}</span>
                      <span>{it.price}</span>
                    </div>
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
