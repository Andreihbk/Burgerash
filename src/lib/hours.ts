// Single source of truth for opening hours, contact info and prep-time text.
// Pure module: safe to import from client components and API routes.

import { SITE_ADDRESS } from "./site";

export const TIMEZONE = "Europe/Bucharest";

/** Shown as a fixed text until a live queue time exists. */
export const PREP_TEXT = "Gata în ~15 min";

/**
 * Contact details. While a value is null the site hides that line (no tel: link / no address).
 */
export const CONTACT: { phone: string | null; address: string | null } = {
  phone: null,
  address: SITE_ADDRESS.line,
};

type DayHours = { open: number; close: number }; // minutes from midnight; close 1440 = midnight

const WEEKDAY: DayHours = { open: 10 * 60, close: 22 * 60 };
const WEEKEND: DayHours = { open: 12 * 60, close: 24 * 60 };

/** Index 0 = Sunday ... 6 = Saturday. */
export const HOURS: readonly DayHours[] = [WEEKEND, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKEND];

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export const formatTime = (minutes: number) => {
  const m = minutes % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export type OpeningStatus = {
  open: boolean;
  /** Today's hours, e.g. "10:00 - 22:00". */
  todayHours: string;
  /** When open: closing time, e.g. "22:00". */
  closesAt: string | null;
  /** When closed: next opening, e.g. { when: "mâine", time: "10:00" }. */
  next: { when: string; time: string } | null;
};

function bucharestNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

export function getStatus(now: Date = new Date()): OpeningStatus {
  const { day, minutes } = bucharestNow(now);
  const today = HOURS[day];
  const todayHours = `${formatTime(today.open)} - ${formatTime(today.close)}`;

  if (minutes >= today.open && minutes < today.close) {
    return { open: true, todayHours, closesAt: formatTime(today.close), next: null };
  }

  if (minutes < today.open) {
    return { open: false, todayHours, closesAt: null, next: { when: "azi", time: formatTime(today.open) } };
  }

  const nextDay = (day + 1) % 7;
  return {
    open: false,
    todayHours,
    closesAt: null,
    next: { when: "mâine", time: formatTime(HOURS[nextDay].open) },
  };
}

/**
 * Start of the next day's schedule (Ebriza POS snooze end: "next day at the start of the schedule").
 * Before today's opening (after midnight) that is today's opening. Accurate to the minute;
 * a DST switch overnight can shift it by one hour, which is fine for a snooze.
 */
export function nextScheduleStart(now: Date = new Date()): Date {
  const { day, minutes } = bucharestNow(now);
  const minutesAhead =
    minutes < HOURS[day].open ? HOURS[day].open - minutes : 1440 - minutes + HOURS[(day + 1) % 7].open;
  const result = new Date(now.getTime() + minutesAhead * 60_000);
  result.setUTCSeconds(0, 0);
  return result;
}

export function statusLabel(status: OpeningStatus): string {
  if (status.open) return `Deschis până la ${status.closesAt}`;
  return `Închis · deschidem ${status.next?.when} la ${status.next?.time}`;
}

/** Short header label: "Deschis" / "Închis". */
export function shortStatusLabel(status: OpeningStatus): string {
  return status.open ? "Deschis" : "Închis";
}

/** Hero line. Never claims the grill is on while closed. */
export function heroStatusLine(status: OpeningStatus): string {
  if (status.open) return "Plita e pornită · gata în ~15 min";
  return `Plita e oprită · deschidem ${status.next?.when} la ${status.next?.time}`;
}

/** Notice at the top of the cart while closed. */
export function closedCartNotice(status: OpeningStatus): string {
  return `Suntem închiși acum · deschidem ${status.next?.when} la ${status.next?.time}. Poți pregăti coșul.`;
}

/** Weekly schedule grouped for display, e.g. [{ label: "Luni - Vineri", hours: "10:00 - 22:00" }, ...]. */
export function scheduleLines(): { label: string; hours: string }[] {
  const fmt = (h: DayHours) => `${formatTime(h.open)} - ${formatTime(h.close)}`;
  return [
    { label: "Luni - Vineri", hours: fmt(WEEKDAY) },
    { label: "Sâmbătă - Duminică", hours: fmt(WEEKEND) },
  ];
}

export const CLOSED_ORDER_ERROR = "Suntem închiși acum. Comenzile se pot plasa în programul de funcționare.";

/**
 * Pickup time slots for today: every 15 min, from ~20 min from now (rounded up) until 15 min before closing,
 * at most `max` slots. Empty when closed for the rest of the day. Before opening, slots start at opening + 15.
 */
export function pickupSlots(now: Date = new Date(), max = 8): string[] {
  const { day, minutes } = bucharestNow(now);
  const today = HOURS[day];
  const earliest = Math.max(minutes + 20, today.open + 15);
  let t = Math.ceil(earliest / 15) * 15;
  const slots: string[] = [];
  while (t <= today.close - 15 && slots.length < max) {
    slots.push(formatTime(t));
    t += 15;
  }
  return slots;
}
