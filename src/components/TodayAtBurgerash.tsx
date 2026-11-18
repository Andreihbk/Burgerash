import { Clock, MapPin, Phone } from "lucide-react";
import { CONTACT, PREP_TEXT, statusLabel, type OpeningStatus } from "@/lib/hours";

export default function TodayAtBurgerash({ status }: { status: OpeningStatus | null }) {
  const phoneHref = CONTACT.phone ? `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <section
      aria-labelledby="azi-title"
      className="mb-10 border-2 border-[#332420] rounded-xl bg-[#F5E6CC] p-5 sm:p-6 grid gap-4 sm:grid-cols-2"
    >
      <div>
        <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">AZI LA BURGERASH</p>
        <h2 id="azi-title" className="font-bebas text-3xl sm:text-4xl tracking-wide leading-none mt-1">
          {status ? statusLabel(status).toUpperCase() : " "}
        </h2>
        <p className="font-nunito font-bold text-sm mt-2">
          {status ? `Program azi: ${status.todayHours}` : " "}
        </p>
      </div>

      <ul className="font-nunito font-bold text-sm space-y-2 sm:justify-self-end">
        {status?.open && (
          <li className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#790D20]" aria-hidden />
            <span>{PREP_TEXT}</span>
          </li>
        )}
        {CONTACT.address && (
          <li className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#790D20]" aria-hidden />
            <span>{CONTACT.address}</span>
          </li>
        )}
        {phoneHref && CONTACT.phone && (
          <li className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#790D20]" aria-hidden />
            <a href={phoneHref} className="underline underline-offset-2 hover:text-[#790D20]">
              {CONTACT.phone}
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
