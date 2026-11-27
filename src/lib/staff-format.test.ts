import { describe, expect, it } from "vitest";
import { formatAge, sortOldestFirst } from "./staff-format";

describe("sortOldestFirst", () => {
  it("sorts by created_at ascending without mutating the input", () => {
    const list = [
      { id: "b", created_at: "2026-11-27T12:05:00Z" },
      { id: "a", created_at: "2026-11-27T12:00:00Z" },
    ];
    expect(sortOldestFirst(list).map((o) => o.id)).toEqual(["a", "b"]);
    expect(list[0].id).toBe("b");
  });
});

describe("formatAge", () => {
  const created = "2026-11-27T12:00:00Z";
  const at = (min: number) => new Date(created).getTime() + min * 60_000;
  it("says acum under a minute and never goes negative", () => {
    expect(formatAge(created, at(0.5))).toEqual({ text: "acum", minutes: 0 });
    expect(formatAge(created, at(-5))).toEqual({ text: "acum", minutes: 0 });
  });
  it("shows minutes under an hour", () => {
    expect(formatAge(created, at(7))).toEqual({ text: "7 min", minutes: 7 });
  });
  it("shows hours and minutes after an hour", () => {
    expect(formatAge(created, at(65))).toEqual({ text: "1 h 5 min", minutes: 65 });
  });
});
