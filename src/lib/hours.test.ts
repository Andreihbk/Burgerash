import { describe, expect, it } from "vitest";
import { getStatus, nextScheduleStart, pickupSlots, scheduleLines, statusLabel } from "./hours";

describe("nextScheduleStart (Ebriza snooze end)", () => {
  it("is the next day's opening when snoozed during the day", () => {
    // Wed 2026-11-18 15:20 Bucharest (UTC+2) -> Thu 12:00 = 10:00Z
    expect(nextScheduleStart(new Date("2026-11-18T13:20:00Z")).toISOString()).toBe("2026-11-19T10:00:00.000Z");
    // Fri 21:00 -> Sat 12:00 = 10:00Z
    expect(nextScheduleStart(new Date("2026-11-20T19:00:00Z")).toISOString()).toBe("2026-11-21T10:00:00.000Z");
  });

  it("is today's opening when snoozed after midnight, before opening", () => {
    // Thu 01:30 -> Thu 12:00
    expect(nextScheduleStart(new Date("2026-11-18T23:30:00Z")).toISOString()).toBe("2026-11-19T10:00:00.000Z");
  });
});

// Hours: every day 12:00 - 23:00. Bucharest is UTC+2 in winter, UTC+3 in summer.
// 2026-11-18 = Wednesday, 2026-11-21 = Saturday.
describe("getStatus", () => {
  it("is open on a weekday afternoon", () => {
    const s = getStatus(new Date("2026-11-18T12:00:00Z")); // 14:00 local
    expect(s.open).toBe(true);
    expect(statusLabel(s)).toBe("Deschis până la 23:00");
  });

  it("opens exactly at 12:00 and closes exactly at 23:00", () => {
    expect(getStatus(new Date("2026-11-18T10:00:00Z")).open).toBe(true);
    expect(getStatus(new Date("2026-11-18T09:59:00Z")).open).toBe(false);
    expect(getStatus(new Date("2026-11-18T20:59:00Z")).open).toBe(true);
    expect(getStatus(new Date("2026-11-18T21:00:00Z")).open).toBe(false);
  });

  it("before opening says today", () => {
    const s = getStatus(new Date("2026-11-18T06:00:00Z")); // 08:00 local
    expect(statusLabel(s)).toBe("Închis · deschidem azi la 12:00");
  });

  it("after closing says tomorrow", () => {
    const s = getStatus(new Date("2026-11-18T21:30:00Z")); // 23:30 local
    expect(statusLabel(s)).toBe("Închis · deschidem mâine la 12:00");
  });

  it("weekend has the same hours", () => {
    expect(getStatus(new Date("2026-11-21T09:59:00Z")).open).toBe(false); // 11:59 Sat
    expect(getStatus(new Date("2026-11-21T10:00:00Z")).open).toBe(true); // 12:00 Sat
    expect(getStatus(new Date("2026-11-21T20:59:00Z")).closesAt).toBe("23:00");
    expect(getStatus(new Date("2026-11-21T21:00:00Z")).open).toBe(false); // 23:00 Sat
  });

  it("uses Bucharest time in summer (UTC+3)", () => {
    expect(getStatus(new Date("2026-07-15T09:00:00Z")).open).toBe(true); // 12:00 local
    expect(getStatus(new Date("2026-07-15T08:59:00Z")).open).toBe(false);
  });
});

describe("scheduleLines", () => {
  it("shows one daily line", () => {
    expect(scheduleLines()).toEqual([{ label: "Zilnic", hours: "12:00 - 23:00" }]);
  });
});

describe("pickupSlots", () => {
  it("starts ~20 min from now, rounded up to 15, max 8 (Wed 15:20 Bucharest)", () => {
    const slots = pickupSlots(new Date("2026-11-18T13:20:00Z"));
    expect(slots[0]).toBe("15:45");
    expect(slots).toHaveLength(8);
    expect(slots[7]).toBe("17:30");
  });
  it("before opening starts at opening + 15 (Wed 08:00 Bucharest)", () => {
    expect(pickupSlots(new Date("2026-11-18T06:00:00Z"))[0]).toBe("12:15");
  });
  it("is empty when the last slot has passed (Wed 22:40 Bucharest)", () => {
    expect(pickupSlots(new Date("2026-11-18T20:40:00Z"))).toEqual([]);
  });
});
