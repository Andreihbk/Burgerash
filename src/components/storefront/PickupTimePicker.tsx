"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { pickupSlots, PREP_TEXT } from "@/lib/hours";
import { useCartStore } from "@/store/cartStore";
import { Display } from "@/components/Display";

/** Pickup time chips: "as soon as possible" + today's next 15-min slots. Slots are computed once, when the cart opens. */
export default function PickupTimePicker() {
  const pickupTime = useCartStore((s) => s.pickupTime);
  const setPickupTime = useCartStore((s) => s.setPickupTime);
  const [slots] = useState(() => pickupSlots());

  const chip = (active: boolean) =>
    `min-h-11 rounded-lg border-2 font-nunito font-black text-sm transition-colors ${
      active
        ? "bg-[#790D20] text-[#F5E6CC] border-[#332420] shadow-[2px_2px_0px_0px_#332420]"
        : "bg-[#F5E6CC] text-[#332420] border-[#332420]/40 hover:border-[#332420]"
    }`;

  return (
    <fieldset className="mb-6">
      <legend className="flex items-center gap-2 font-bebas text-xl text-[#332420] mb-2">
        <Clock className="w-4 h-4" aria-hidden />
        <Display>CÂND VII DUPĂ EA?</Display>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" aria-pressed={pickupTime === null} onClick={() => setPickupTime(null)} className={`col-span-3 ${chip(pickupTime === null)}`}>
          Cât mai repede · {PREP_TEXT.toLowerCase()}
        </button>
        {slots.map((t) => (
          <button key={t} type="button" aria-pressed={pickupTime === t} onClick={() => setPickupTime(t)} className={chip(pickupTime === t)}>
            {t}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
