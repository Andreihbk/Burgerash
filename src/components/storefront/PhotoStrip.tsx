import Image, { type StaticImageData } from "next/image";
import smashCut from "../../../public/images/marketing/strip-smash-cut.jpg";
import crispyChicken from "../../../public/images/marketing/strip-crispy-chicken.jpg";
import friesChips from "../../../public/images/marketing/strip-fries-chips.jpg";
import { Display } from "@/components/Display";

// Mood photos only (see docs/PHOTOS.md): never product images, never text on top.
const PHOTOS: { src: StaticImageData; alt: string; caption: string }[] = [
  { src: smashCut, alt: "Smash burger dublu tăiat în două, pe faianța roșie", caption: "SMASH PE PLITĂ" },
  { src: crispyChicken, alt: "Burger cu pui crocant și cheddar pe hârtia burgerash", caption: "PUI CROCANT" },
  { src: friesChips, alt: "Cartofi prăjiți și chips în boluri de inox", caption: "CARTOFI & CHIPS" },
];

/** "FĂCUT PE LOC." photo strip: 3 columns on desktop, swipe (scroll-snap) on mobile. */
export default function PhotoStrip() {
  return (
    <section aria-labelledby="facut-pe-loc" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <h2 id="facut-pe-loc" className="font-bebas text-4xl sm:text-5xl leading-none text-[#332420]">
        <Display>FĂCUT PE LOC.</Display>
      </h2>
      <ul className="mt-6 -mx-4 px-4 pb-3 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 md:scroll-px-0 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {PHOTOS.map((p) => (
          <li key={p.caption} className="snap-start shrink-0 w-[72%] sm:w-[45%] md:w-auto">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420]">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1152px) 360px, (min-width: 768px) 33vw, 72vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs font-bold tracking-widest text-[#790D20]">{p.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
