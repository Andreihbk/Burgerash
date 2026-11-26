import { Plus } from "lucide-react";
import { scheduleLines } from "@/lib/hours";
import { DELIVERY_FEE_STANDARD, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { DELIVERY_RADIUS_KM, SITE_ADDRESS } from "@/lib/site";
import { Display } from "@/components/Display";

const hours = scheduleLines()
  .map((l) => `${l.label}, ${l.hours}`)
  .join("; ");

// Only facts the site already guarantees (hours, zone, fees, card payment). Keep answers to one or two lines.
const FAQ: { q: string; a: string }[] = [
  { q: "Când sunteți deschiși?", a: `${hours}. Sau până se termină, în serile bune.` },
  { q: "Carnea e congelată?", a: "Nu. E proaspătă, în fiecare zi. De-asta uneori se termină înainte de 23." },
  {
    q: "Unde livrați?",
    a: `În raza de ${DELIVERY_RADIUS_KM} km de ${SITE_ADDRESS.street}. Livrarea costă ${DELIVERY_FEE_STANDARD} lei și e gratuită peste ${FREE_DELIVERY_THRESHOLD} lei.`,
  },
  { q: "Pot să vin să o iau eu?", a: "Sigur. Alegi Pick Up, alegi ora, iar comanda te așteaptă la geam." },
  { q: "Cum plătesc?", a: "Online, cu cardul, când trimiți comanda." },
  { q: "Vă găsesc și pe Glovo sau Wolt?", a: "Da. Direct de aici însă comanda ajunge la noi fără intermediari." },
];

/** Mini FAQ: native <details>, no JS. */
export default function FaqSection() {
  return (
    <section id="intrebari" aria-labelledby="faq-titlu" className="mt-20 scroll-mt-24">
      <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">PE SCURT</p>
      <h2 id="faq-titlu" data-reveal className="font-bebas text-4xl sm:text-5xl leading-none text-[#332420] mb-6">
        <Display>ÎNTREBĂRI.</Display>
      </h2>
      <div className="divide-y-2 divide-[#332420] border-y-2 border-[#332420]">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-nunito font-extrabold text-lg text-[#332420] [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="h-5 w-5 shrink-0 text-[#790D20] transition-transform group-open:rotate-45" aria-hidden />
            </summary>
            <p className="pb-4 -mt-1 font-nunito font-semibold text-base text-[#332420]/80 max-w-2xl">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
