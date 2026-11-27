import Image from "next/image";
import heroPhoto from "../../../public/images/marketing/hero-tray-fries.jpg";
import { Display } from "@/components/Display";
import Ticker from "./Ticker";
import PhotoStrip from "./PhotoStrip";
import { HeroFulfillmentButtons, HeroOrderButton, HeroStatusLine, HeroStickerStack } from "./HeroIslands";

// Server component (audit R9): headline, text, chips and photo are plain HTML; only the islands in HeroIslands.tsx hydrate.
/** Hero: headline + stickers + COMANDĂ, then the ticker and the stripe. The old menu board is archived in components/archive. */
export default function HeroBoard() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 md:pt-14 lg:pt-16 grid grid-cols-1 md:grid-cols-2 md:items-center gap-6 md:gap-8 lg:gap-12 md:min-h-[min(calc(100svh-9rem),52rem)]">
        <div className="flex flex-col items-start">
          {/* Each line is skewed on its own from its bottom-left corner, so all lines start on the same left edge. */}
          <h1 className="font-display text-[clamp(3.5rem,8.5vw,6.5rem)] leading-[0.88] text-charcoal">
            {["YOUR", "LOCAL"].map((line) => (
              // The trailing space keeps the words apart in the text Google and screen readers read (audit R5).
              <span key={line} className="block w-fit -skew-x-6 origin-bottom-left"><Display>{line}</Display>{" "}</span>
            ))}
            <span className="block w-fit -skew-x-6 origin-bottom-left text-wine"><Display>BURGER SPOT.</Display></span>
          </h1>
          <p className="font-nunito font-semibold text-xl sm:text-2xl text-charcoal mt-6 max-w-lg">
            Burgeri din carne proaspătă, făcuți pe loc în Sector 6. Comanzi direct de aici, fără comisioane.
          </p>

          {/* Phones: pick the order type first (owner's app concept), then the menu. */}
          <HeroFulfillmentButtons />

          <HeroOrderButton />

          <ul className="mt-6 flex flex-wrap gap-2">
            {["Livrare proprie", "Ridicare în 15 min", "Plata online cu cardul"].map((f) => (
              <li
                key={f}
                className="font-nunito font-bold text-xs sm:text-sm leading-none px-3 py-2 rounded-md bg-wine text-sand"
              >
                {f}
              </li>
            ))}
          </ul>

          <HeroStatusLine />
        </div>

        {/* Photo + stickers: right column on md+, under the COMANDĂ block on mobile (ordering stays above the fold). */}
        <div className="relative w-full max-w-md md:max-w-[30rem] mx-auto mb-14 md:mb-10">
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl border-2 border-charcoal shadow-[6px_6px_0px_0px_var(--color-charcoal)]">
            <Image
              src={heroPhoto}
              alt="Burger cu cartofi prăjiți pe tavă, în fața faianței roșii burgerash"
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1152px) 480px, (min-width: 768px) 45vw, 100vw"
              className="object-cover object-[50%_60%]"
            />
          </div>
          <div className="absolute -left-3 -bottom-14 md:-left-8 md:-bottom-12">
            <div className="md:hidden"><HeroStickerStack size={88} /></div>
            <div className="hidden md:block"><HeroStickerStack size={120} /></div>
          </div>
        </div>
      </section>

      <Ticker />
      <PhotoStrip />
      <div aria-hidden className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-3 border-y-[3px] border-wine rounded-tr-3xl rounded-bl-3xl" />
      </div>
      <div className="h-4 lg:h-6" />

    </>
  );
}
