import Image from "next/image";
import aboutBacon from "../../../public/images/marketing/about-bacon.jpg";
import { SITE_ADDRESS } from "@/lib/site";
import { Display } from "@/components/Display";

const FACTS = ["CARNE PROASPĂTĂ, ZILNIC", "FĂCUT LA COMANDĂ", "LÂNGĂ LICEU, SECTOR 6"];

/** "Despre noi": big wine panel near the bottom, one large mood photo. Text sits next to the photo, never on it. */
export default function AboutSection() {
  return (
    <section
      id="despre"
      aria-labelledby="despre-titlu"
      className="mt-20 scroll-mt-24 overflow-hidden rounded-xl border-4 border-[#332420] bg-[#790D20] text-[#F5E6CC] shadow-[6px_6px_0px_0px_#332420]"
    >
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[560px] border-b-4 md:border-b-0 md:border-r-4 border-[#332420]">
          <Image
            src={aboutBacon}
            alt="Burger cu bacon și cheddar pe faianța roșie"
            fill
            placeholder="blur"
            sizes="(min-width: 1152px) 500px, (min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="p-8 sm:p-10 md:p-14 flex flex-col justify-center">
          <p className="font-mono text-xs font-bold tracking-widest text-[#F5E6CC]/80">DESPRE NOI</p>
          <h2 id="despre-titlu" className="font-bebas text-5xl sm:text-7xl leading-[0.9] mt-2 mb-8">
            <Display>DIN CARTIER.</Display>
          </h2>
          <div className="space-y-4 font-nunito font-semibold text-lg sm:text-xl text-[#F5E6CC]/90 max-w-lg">
            <p>Un burger spot mic din {SITE_ADDRESS.sector}, fix lângă liceu.</p>
            <p>Carne proaspătă, puține lucruri pe meniu, făcute bine. Fiecare burger se face când îl comanzi.</p>
            <p>Treci pe la geam sau comandă de aici. Ne vedem.</p>
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {FACTS.map((f) => (
              <li
                key={f}
                className="font-bebas text-lg sm:text-xl leading-none px-4 py-2.5 rounded-lg bg-[#F5E6CC] text-[#790D20] border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420]"
              >
                <Display>{f}</Display>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
