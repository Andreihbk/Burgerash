import type { Order } from "@/types/database";

// Pure helpers shared by the staff screens (/kitchen, /dispatch, /rider). Audit R13.

/** Oldest order first (by created_at). Returns a new array. */
export function sortOldestFirst<T extends Pick<Order, "created_at">>(list: T[]): T[] {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** Age of an order for the live timer: "acum", "7 min", "1 h 5 min". */
export function formatAge(createdAt: string, now: number): { text: string; minutes: number } {
  const secs = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  const minutes = Math.floor(secs / 60);
  if (minutes < 1) return { text: "acum", minutes };
  if (minutes < 60) return { text: `${minutes} min`, minutes };
  return { text: `${Math.floor(minutes / 60)} h ${minutes % 60} min`, minutes };
}
