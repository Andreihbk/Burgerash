// Pure: shared by the storefront hook (client) and the server-side stock check.

export interface StockRow {
  product_id: string;
  sold_out?: boolean;
  /** Ebriza POS snooze expiry (ISO); null/absent = no expiry. */
  snoozed_until?: string | null;
}

/** True while a POS snooze is still running (or there is no expiry at all). */
export function isSnoozeActive(row: Pick<StockRow, "snoozed_until">, now: Date = new Date()): boolean {
  return !row.snoozed_until || new Date(row.snoozed_until).getTime() > now.getTime();
}

/** Sold out right now: flagged, and any POS snooze has not expired yet. */
export function isRowSoldOut(row: StockRow, now: Date = new Date()): boolean {
  return Boolean(row.sold_out) && isSnoozeActive(row, now);
}
