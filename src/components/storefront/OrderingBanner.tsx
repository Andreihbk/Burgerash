import { isOrderingEnabled, ORDERING_CLOSED_BANNER } from "@/lib/ordering";

/** Pre-launch banner; renders nothing once NEXT_PUBLIC_ORDERING_ENABLED is "true". */
export default function OrderingBanner() {
  if (isOrderingEnabled()) return null;
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border-2 border-[#790D20] bg-[#790D20] px-4 py-3 text-center font-nunito text-base font-black text-[#F5E6CC]"
    >
      {ORDERING_CLOSED_BANNER}
    </div>
  );
}
