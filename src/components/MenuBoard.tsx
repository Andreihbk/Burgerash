"use client";

import { BrandLogo } from "./BrandLogo";

// Lightbox menu board, as on the physical sign. Prices follow the menu board.
export default function MenuBoard({
  linkedNames = [],
  onLineActive,
}: {
  /** Lines that react to hover/focus (they bring their sticker to the top of the stack). */
  linkedNames?: string[];
  onLineActive?: (name: string | null) => void;
}) {
  return (
    <section id="lightboard" aria-label="Panou meniu" className="w-full max-w-xl mx-auto scroll-mt-24">
      <div className="bg-[#790D20] p-4 rounded-xl shadow-[10px_10px_0px_0px_#332420] border-4 border-[#332420]">
        <div className="bg-[#F5E6CC] text-[#790D20] p-6 sm:p-10 rounded-lg shadow-inner border-2 border-[#790D20]/30 relative">
          {/* Header Panou */}
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <BrandLogo layout="stacked" className="h-20 sm:h-24 w-auto text-[#790D20]" />
              <p className="font-nunito font-bold text-xs tracking-widest text-[#332420]">
                hand crafted burgers
              </p>
            </div>
          </div>

          {/* Secțiunile Panoului Luminos */}
          <div className="space-y-6">
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
              <div key={group.title} className="relative pr-5">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bebas text-2xl tracking-wider text-[#332420] shrink-0">
                    {group.title}
                  </h3>
                  <div className="flex-1 h-2 border-y-2 border-[#790D20] rounded-tr-xl" />
                </div>
                <div className="space-y-1.5 pl-1 border-r-4 border-double border-[#790D20] pr-4">
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
                      className="flex justify-between items-center font-nunito font-black text-base text-[#332420] rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
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
          <div className="mt-8 pt-4 border-t-4 border-double border-[#790D20] flex justify-end">
            <div className="font-nunito font-black text-xs tracking-widest text-[#332420] leading-tight text-right">
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
