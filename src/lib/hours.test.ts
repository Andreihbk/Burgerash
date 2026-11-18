import { describe, expect, it } from "vitest";
import { getStatus, statusLabel } from "./hours";

// Bucharest is UTC+2 in winter, UTC+3 in summer. 2026-11-18 = Wednesday, 2026-11-21 = Saturday.
describe("getStatus", () => {
  it("is open on a weekday afternoon", () => {
    const s = getStatus(new Date("2026-11-18T12:00:00Z")); // 14:00 local
    expect(s.open).toBe(true);
    expect(statusLabel(s)).toBe("Deschis până la 22:00");
  });

  it("opens exactly at 10:00 and closes exactly at 22:00 on weekdays", () => {
    expect(getStatus(new Date("2026-11-18T08:00:00Z")).open).toBe(true);
    expect(getStatus(new Date("2026-11-18T07:59:00Z")).open).toBe(false);
    expect(getStatus(new Date("2026-11-18T19:59:00Z")).open).toBe(true);
    expect(getStatus(new Date("2026-11-18T20:00:00Z")).open).toBe(false);
  });

  it("before opening says today", () => {
    const s = getStatus(new Date("2026-11-18T06:00:00Z")); // 08:00 local
    expect(statusLabel(s)).toBe("Închis · deschidem azi la 10:00");
  });

  it("after closing says tomorrow", () => {
    const s = getStatus(new Date("2026-11-18T21:00:00Z")); // 23:00 local
    expect(statusLabel(s)).toBe("Închis · deschidem mâine la 10:00");
  });

  it("weekend runs 12:00 to midnight", () => {
    expect(getStatus(new Date("2026-11-21T09:59:00Z")).open).toBe(false); // 11:59 Sat
    expect(getStatus(new Date("2026-11-21T10:00:00Z")).open).toBe(true); // 12:00 Sat
    const late = getStatus(new Date("2026-11-21T21:30:00Z")); // 23:30 Sat
    expect(late.open).toBe(true);
    expect(late.closesAt).toBe("00:00");
    expect(getStatus(new Date("2026-11-21T22:00:00Z")).open).toBe(false); // 00:00 Sun
  });

  it("Friday night leads to Saturday 12:00", () => {
    const s = getStatus(new Date("2026-11-20T21:00:00Z")); // 23:00 Fri
    expect(statusLabel(s)).toBe("Închis · deschidem mâine la 12:00");
  });

  it("uses Bucharest time in summer (UTC+3)", () => {
    expect(getStatus(new Date("2026-07-15T07:00:00Z")).open).toBe(true); // 10:00 local
    expect(getStatus(new Date("2026-07-15T06:59:00Z")).open).toBe(false);
  });
});
