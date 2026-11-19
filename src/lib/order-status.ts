import type { FulfillmentType, OrderStatus } from "@/types/database";

// 32 hex chars from the create_order default. Checked before any DB lookup.
export const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

export interface StatusStep {
  status: OrderStatus;
  label: string;
}

/** Steps the customer sees; pickup has no courier step. */
export function statusSteps(type: FulfillmentType): StatusStep[] {
  if (type === "pickup") {
    return [
      { status: "pending", label: "Primită" },
      { status: "preparing", label: "În preparare" },
      { status: "ready_for_packing", label: "Gata de ridicare" },
      { status: "delivered", label: "Ridicată" },
    ];
  }
  return [
    { status: "pending", label: "Primită" },
    { status: "preparing", label: "În preparare" },
    { status: "ready_for_packing", label: "Se ambalează" },
    { status: "out_for_delivery", label: "Pe drum" },
    { status: "delivered", label: "Livrată" },
  ];
}

export const isFinalStatus = (s: OrderStatus) => s === "delivered" || s === "canceled";
