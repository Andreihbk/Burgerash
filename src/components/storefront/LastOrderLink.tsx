"use client";

import { useEffect, useState } from "react";
import { readLastOrder, subscribeLastOrder, type LastOrder } from "@/lib/last-order";
import { Display } from "@/components/Display";

/** Small "Comanda ta" link to the saved order status page (cleared once the order is delivered/canceled). */
export default function LastOrderLink() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const sync = () => setOrder(readLastOrder());
    sync();
    return subscribeLastOrder(sync);
  }, []);

  if (!order) return null;
  return (
    <a
      href={`/comanda/${order.token}`}
      className="inline-flex items-center min-h-11 font-display text-lg tracking-wider underline underline-offset-4 text-sand/90 hover:text-sand"
    >
      <Display>COMANDA TA</Display>
    </a>
  );
}
