"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import burgerCut from "../../../public/images/marketing/strip-burger-cut.jpg";
import handFries from "../../../public/images/marketing/carousel-hand-fries.jpg";
import crispyChicken from "../../../public/images/marketing/strip-crispy-chicken.jpg";
import topviewThree from "../../../public/images/marketing/carousel-topview-three.jpg";
import friesChips from "../../../public/images/marketing/strip-fries-chips.jpg";
import chickenFries from "../../../public/images/marketing/carousel-chicken-fries.jpg";
import wrapped from "../../../public/images/marketing/carousel-wrapped.jpg";
import { Display } from "@/components/Display";
import { prefersReducedMotion } from "./layout";

// Mood photos only (see docs/PHOTOS.md): never product images, never text on top.
const SLIDES: { src: StaticImageData; alt: string }[] = [
  { src: burgerCut, alt: "Burger dublu tăiat în două, pe faianța roșie" },
  { src: handFries, alt: "Mână care ia cartofi prăjiți de pe tava cu burger" },
  { src: crispyChicken, alt: "Burger cu pui crocant și cheddar pe hârtia burgerash" },
  { src: topviewThree, alt: "Trei burgeri văzuți de sus, pe hârtia burgerash" },
  { src: friesChips, alt: "Cartofi prăjiți și chips în boluri de inox" },
  { src: chickenFries, alt: "Burger cu pui crocant și un bol de cartofi prăjiți" },
  { src: wrapped, alt: "Burger împachetat în hârtie cu sticker burgerash" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** "FĂCUT PE LOC." swipeable photo carousel: snap scrolling, arrows + counter. No autoplay. */
export default function PhotoStrip() {
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  // Current slide = the one whose left edge is closest to the scroller's left edge.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const items = Array.from(el.children) as HTMLElement[];
        const left = el.scrollLeft;
        let best = 0;
        items.forEach((item, i) => {
          if (Math.abs(item.offsetLeft - el.offsetLeft - left) < Math.abs(items[best].offsetLeft - el.offsetLeft - left)) best = i;
        });
        // At the end of the track the last slides can't reach the left edge: count it as the last one.
        if (left + el.clientWidth >= el.scrollWidth - 4) best = items.length - 1;
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    const el = scroller.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const arrow =
    "grid place-items-center w-11 h-11 rounded-full bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-[#332420] disabled:opacity-40 disabled:hover:bg-[#790D20] transition-colors duration-200";

  return (
    <section aria-labelledby="facut-pe-loc" aria-roledescription="carusel" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="flex items-end justify-between gap-4">
        <h2 id="facut-pe-loc" className="font-bebas text-3xl sm:text-5xl leading-none whitespace-nowrap text-[#332420]">
          <Display>FĂCUT PE LOC.</Display>
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-xs font-bold tracking-widest whitespace-nowrap text-[#790D20]" aria-live="polite">
            {pad(index + 1)} / {pad(SLIDES.length)}
          </span>
          <button type="button" className={arrow} onClick={() => go(-1)} disabled={index === 0} aria-label="Poza anterioară">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" className={arrow} onClick={() => go(1)} disabled={index === SLIDES.length - 1} aria-label="Poza următoare">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        className="mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 pb-3 flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s, i) => (
          <li key={s.alt} className="snap-start shrink-0 w-[78%] sm:w-[45%] md:w-[31%]" aria-label={`${i + 1} din ${SLIDES.length}`}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420]">
              <Image
                src={s.src}
                alt={s.alt}
                fill
                placeholder="blur"
                sizes="(min-width: 1152px) 340px, (min-width: 768px) 31vw, (min-width: 640px) 45vw, 78vw"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
