"use client";

import { useEffect } from "react";
import { clearLastOrder } from "@/lib/last-order";

/** Rendered only for delivered/canceled orders: forget the saved link so the header stops showing it. */
export default function ClearLastOrder({ token }: { token: string }) {
  useEffect(() => clearLastOrder(token), [token]);
  return null;
}
