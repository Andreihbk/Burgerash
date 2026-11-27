import Image, { type StaticImageData } from "next/image";
import motion from "../../../public/images/marketing/ig-motion.jpg";
import crispy from "../../../public/images/marketing/ig-crispy.jpg";
import topview from "../../../public/images/marketing/ig-topview.jpg";
import wrapped from "../../../public/images/marketing/carousel-wrapped.jpg";
import { INSTAGRAM_URL } from "@/lib/site";
import { Display } from "@/components/Display";

// Our own photos linking to the profile (no Instagram API, no third-party script).
const TILES: { src: StaticImageData; alt: string }[] = [
  { src: motion, alt: "Burger cu cheddar, fotografiat în mișcare" },
  { src: crispy, alt: "Burger cu pui crocant pe hârtia burgerash" },
  { src: topview, alt: "Burger și cartofi prăjiți văzuți de sus" },
  { src: wrapped, alt: "Burger împachetat cu sticker burgerash" },
];

export default function InstagramStrip() {
  return (
    <section aria-labelledby="ig-titlu" className="mt-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 id="ig-titlu" data-reveal className="font-display text-3xl sm:text-5xl leading-none text-[#332420]">
          <Display>@BURGERASH</Display>
        </h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-display text-lg sm:text-xl px-4 py-2 rounded-lg bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-[#332420] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
          </svg>
          <Display>URMĂREȘTE-NE</Display>
        </a>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {TILES.map((t) => (
          <li key={t.alt}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.alt}, pe Instagram`}
              className="group relative block aspect-square overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420]"
            >
              <Image
                src={t.src}
                alt=""
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 270px, 45vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
