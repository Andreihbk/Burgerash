import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { formatLei } from "@/lib/format";

/** Progress to free delivery (delivery orders only). */
export default function FreeDeliveryBar({ subtotal }: { subtotal: number }) {
  const left = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  return (
    <div className="py-1">
      <p className="font-nunito font-bold text-xs text-[#332420] mb-1.5" aria-live="polite">
        {left > 0 ? (
          <>Mai ai <span className="font-black text-[#790D20]">{formatLei(left)}</span> până la livrare gratuită</>
        ) : (
          <span className="font-black text-[#790D20]">Ai livrare gratuită!</span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progres livrare gratuită"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-3 rounded-full border-2 border-[#332420] bg-[#F5E6CC] overflow-hidden"
      >
        <div className="h-full bg-[#790D20] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
