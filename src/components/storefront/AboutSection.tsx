import Image from "next/image";
import aboutBacon from "../../../public/images/marketing/about-bacon.jpg";
import { SITE_ADDRESS } from "@/lib/site";
import { Display } from "@/components/Display";

/** "Despre noi": three short lines + one mood photo. Text sits next to the photo, never on it. */
export default function AboutSection() {
  return (
    <section id="despre" aria-labelledby="despre-titlu" className="mt-20 scroll-mt-24 grid gap-8 md:grid-cols-[384px_1fr] md:gap-14 md:items-center">
      <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420]">
        <Image
          src={aboutBacon}
          alt="Burger cu bacon și cheddar pe faianța roșie"
          fill
          placeholder="blur"
          sizes="(min-width: 768px) 384px, 90vw"
          className="object-cover"
        />
      </div>
      <div>
        <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">DESPRE NOI</p>
        <h2 id="despre-titlu" className="font-bebas text-4xl sm:text-5xl leading-none text-[#332420] mb-6">
          <Display>DIN CARTIER.</Display>
        </h2>
        <div className="space-y-3 font-nunito font-semibold text-lg text-[#332420]/90 max-w-md">
          <p>Un burger spot mic din {SITE_ADDRESS.sector}, fix lângă liceu.</p>
          <p>Puține lucruri pe meniu, făcute bine. Fiecare burger se face când îl comanzi.</p>
          <p>Treci pe la geam sau comandă de aici. Ne vedem.</p>
        </div>
      </div>
    </section>
  );
}
