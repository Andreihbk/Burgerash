"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCartStore } from "@/store/cartStore";

// Loaded the first time the cart opens; stays mounted afterwards so checkout state survives close/open.
const CartDrawer = dynamic(() => import("../CartDrawer"), { ssr: false });

export default function CartDrawerHost() {
  const isOpen = useCartStore((s) => s.isOpen);
  const [everOpened, setEverOpened] = useState(isOpen);
  if (isOpen && !everOpened) setEverOpened(true);
  return everOpened ? <CartDrawer /> : null;
}
