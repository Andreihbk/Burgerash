import Image from "next/image";
import { MapPin } from "lucide-react";
import trayHand from "../../../public/images/marketing/location-tray-hand.jpg";
import { scheduleLines } from "@/lib/hours";
import { DELIVERY_RADIUS_KM, GOOGLE_MAPS_URL, SITE_ADDRESS } from "@/lib/site";
import OpenCartButton from "./OpenCartButton";
import PartnerApps from "./PartnerApps";
import LocationMapLoader from "./LocationMapLoader";
import { Display } from "@/components/Display";

export default function LocationSection() {
  return (
    <section
      id="locatie"
      className="mt-20 scroll-mt-24 border-4 border-[#332420] rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#332420]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#790D20] text-[#F5E6CC] p-8 md:p-10">
          <div className="inline-flex items-center gap-2 text-[#F5E6CC] font-mono text-xs font-bold mb-2">
            <MapPin className="w-4 h-4" />
            <span>CARTIERUL CRUSTEI</span>
          </div>
          <h3 className="font-bebas text-4xl sm:text-5xl mb-4 text-[#F5E6CC]"><Display>UNDE GĂSEȘTI CRUSTA</Display></h3>
          <p className="font-nunito font-bold text-base text-[#F5E6CC]/80 mb-6">
            Fix lângă liceu, în {SITE_ADDRESS.sector}, {SITE_ADDRESS.city}. Urmărește mirosul de vită Black Angus caramelizată pe plită.
          </p>
          <address className="not-italic font-nunito font-extrabold text-xl mb-1">{SITE_ADDRESS.line}</address>
          <p className="font-mono text-xs text-[#F5E6CC]/80 mb-4">Livrare în raza de {DELIVERY_RADIUS_KM} km</p>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-6 font-bebas text-xl tracking-wide px-5 py-2.5 rounded-lg bg-[#F5E6CC] text-[#790D20] border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-white transition-colors"
          >
            <Display>DESCHIDE ÎN GOOGLE MAPS</Display>
          </a>
          <div className="font-mono text-sm space-y-1.5 border-t border-[#F5E6CC]/20 pt-4">
            <p className="text-[#F5E6CC] font-bold">PROGRAMUL DE FOC:</p>
            {scheduleLines().map((l) => (
              <p key={l.label}>
                {l.label}: {l.hours}
              </p>
            ))}
          </div>
        </div>

        <div className="border-t-4 md:border-t-0 md:border-l-4 border-[#332420] h-[320px] md:h-auto md:min-h-[420px] relative">
          <LocationMapLoader />
        </div>
      </div>

      <div className="bg-[#F5E6CC] text-[#332420] p-8 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t-4 border-[#332420]">
        <div className="relative w-32 sm:w-40 shrink-0 aspect-[4/5] overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420]">
          <Image
            src={trayHand}
            alt="Burger cu cheddar servit pe tavă"
            fill
            placeholder="blur"
            sizes="160px"
            className="object-cover"
          />
        </div>
        <div className="sm:flex-1">
          <h3 className="font-bebas text-4xl sm:text-5xl mb-4"><Display>LIVRARE PROPRIE & PICKUP</Display></h3>
          <p className="font-nunito font-bold text-base text-[#332420]/90 max-w-2xl">
            Comandă direct de pe site fără comisioane ascunse. Livrare gratuită în cartier la comenzi de peste 120 LEI sau ridicare direct de la geam în 15 minute.
          </p>
        </div>
        <div className="self-start shrink-0 flex flex-col gap-4">
          <OpenCartButton className="bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl px-8 py-3.5 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] transition-all">
            <Display>DESCHIDE COȘUL DE COMANDĂ</Display>
          </OpenCartButton>
          <PartnerApps />
        </div>
      </div>
    </section>
  );
}
