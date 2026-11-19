import { MapPin } from "lucide-react";
import { scheduleLines } from "@/lib/hours";
import OpenCartButton from "./OpenCartButton";

export default function LocationSection() {
  return (
    <section
      id="location"
      className="mt-20 grid grid-cols-1 md:grid-cols-2 border-4 border-[#332420] rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#332420]"
    >
      <div className="bg-[#790D20] text-[#F5E6CC] p-8 md:p-10">
        <div className="inline-flex items-center gap-2 text-[#F5E6CC] font-mono text-xs font-bold mb-2">
          <MapPin className="w-4 h-4" />
          <span>CARTIERUL CRUSTEI</span>
        </div>
        <h3 className="font-bebas text-5xl tracking-wide mb-4 text-[#F5E6CC]">UNDE GĂSEȘTI CRUSTA</h3>
        <p className="font-nunito font-bold text-base text-[#F5E6CC]/80 mb-6">
          Fix lângă liceu, în Sector 6, București. Urmărește mirosul de vită Black Angus caramelizată pe plită.
        </p>
        <div className="font-mono text-sm space-y-1.5 border-t border-[#F5E6CC]/20 pt-4">
          <p className="text-[#F5E6CC] font-bold">PROGRAMUL DE FOC:</p>
          {scheduleLines().map((l) => (
            <p key={l.label}>
              {l.label}: {l.hours}
            </p>
          ))}
        </div>
      </div>

      <div className="bg-[#F5E6CC] text-[#332420] p-8 md:p-10 flex flex-col justify-between border-t-4 md:border-t-0 md:border-l-4 border-[#332420]">
        <div>
          <h3 className="font-bebas text-5xl tracking-wide mb-4">LIVRARE PROPRIE & PICKUP</h3>
          <p className="font-nunito font-bold text-base text-[#332420]/90 mb-6">
            Comandă direct de pe site fără comisioane ascunse. Livrare gratuită în cartier la comenzi de peste 120 LEI sau ridicare direct de la geam în 15 minute.
          </p>
        </div>
        <OpenCartButton className="self-start bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl px-8 py-3.5 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] transition-all">
          DESCHIDE COȘUL DE COMANDĂ
        </OpenCartButton>
      </div>
    </section>
  );
}
