import { TIMEZONE } from "./hours";

// Start of the current calendar day (00:00) in Europe/Bucharest, as a UTC instant.
// "Today" for /admin = from this instant until now; independent of the opening hours.

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

function localParts(date: Date) {
  const get: Record<string, number> = {};
  for (const p of partsFormat.formatToParts(date)) if (p.type !== "literal") get[p.type] = Number(p.value);
  return get;
}

/** Bucharest offset from UTC in ms at the given instant (+2h winter, +3h summer). */
function offsetMs(date: Date): number {
  const p = localParts(date);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
}

export function bucharestDayStart(now: Date = new Date()): Date {
  const p = localParts(now);
  const localMidnightAsUtc = Date.UTC(p.year, p.month - 1, p.day);
  // Two passes: the offset at the true midnight can differ from the offset at "now" (DST days).
  let start = localMidnightAsUtc - offsetMs(now);
  start = localMidnightAsUtc - offsetMs(new Date(start));
  return new Date(start);
}
