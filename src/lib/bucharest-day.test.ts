import { describe, expect, it } from "vitest";
import { bucharestDayStart } from "./bucharest-day";

describe("bucharestDayStart", () => {
  it("winter (UTC+2): midnight Bucharest is 22:00 UTC the day before", () => {
    expect(bucharestDayStart(new Date("2026-01-15T10:30:00Z")).toISOString()).toBe("2026-01-14T22:00:00.000Z");
  });

  it("summer (UTC+3): midnight Bucharest is 21:00 UTC the day before", () => {
    expect(bucharestDayStart(new Date("2026-07-15T10:30:00Z")).toISOString()).toBe("2026-07-14T21:00:00.000Z");
  });

  it("just after local midnight still belongs to the new day", () => {
    // 00:30 Bucharest (UTC+2) on 16 Jan = 22:30 UTC on 15 Jan
    expect(bucharestDayStart(new Date("2026-01-15T22:30:00Z")).toISOString()).toBe("2026-01-15T22:00:00.000Z");
  });

  it("just before local midnight belongs to the old day", () => {
    expect(bucharestDayStart(new Date("2026-01-15T21:30:00Z")).toISOString()).toBe("2026-01-14T22:00:00.000Z");
  });

  it("spring-forward day (29 Mar 2026): midnight is still UTC+2", () => {
    expect(bucharestDayStart(new Date("2026-03-29T12:00:00Z")).toISOString()).toBe("2026-03-28T22:00:00.000Z");
  });

  it("fall-back day (25 Oct 2026): midnight is still UTC+3", () => {
    expect(bucharestDayStart(new Date("2026-10-25T12:00:00Z")).toISOString()).toBe("2026-10-24T21:00:00.000Z");
  });
});
